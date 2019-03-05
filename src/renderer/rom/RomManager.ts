import {EventEmitter} from "events";
import SocketServer, { Message, MessagePayload } from './SocketServer';
import { NLUIntentAndEntities } from '../NLUController';
import { ResponseMessage } from './commands/CommandHandler';
import Log from '../utils/Log';
import parentLog from '../log';

export type RomManagerOptions = {

}

// Remote Operation Mode Manager
export default class RomManager extends EventEmitter {

    private static _instance: RomManager;

    public socketServer: SocketServer;
    public isReadyForCommand: boolean;
    public log: Log;
    
    private _onMessageHandler: any = this.onMessage.bind(this);

    constructor(options?: RomManagerOptions) {
        super ();
        this.isReadyForCommand = true;
    }

    static Instance(options?: RomManagerOptions)
    {
        return this._instance || (this._instance = new this(options));
    }

    init(): void {
        this.log = parentLog.createChild('rom-manager');
    }

    start(): void {
        this.socketServer = new SocketServer();
        this.socketServer.on('message', this._onMessageHandler);
    }

    onMessage(message: Message): void {
        console.log(`RomManager: onMessage:`, message);
        const payload: MessagePayload = message.payload;

        switch (payload.command) {
            case 'say':
                this.emit('say', payload.prompt);
                break;
        }
    }

    onHotword(): void {
        const payload: MessagePayload = {
            command: 'hotword'
        }
        this.sendMessage(payload);
    }

    onUtterance(utterance: string): void {
        const payload: MessagePayload = {
            command: 'utterance',
            data: utterance
        }
        this.sendMessage(payload);
    }

    onNLU(intentAndEntities: NLUIntentAndEntities, utterance: string): void {
        const payload: MessagePayload = {
            command: 'nlu',
            data: {
                intentAndEntities: intentAndEntities,
                utterance: utterance
            }
        }
        this.sendMessage(payload);
    }

    sendMessage(payload: MessagePayload): void {
        if (this.socketServer) {
            let currentTime: number = new Date().getTime();
            let message: Message = {
                client: 'robokit',
                id: -1,
                type: 'rom',
                timestamp: currentTime,
                payload: payload
            }
            this.socketServer.broadcastMessage(message);
        }
    }

    sendWebsocketMessage(type: string = 'transaction', responseMessage: ResponseMessage): void {

    }

    getNetworkTime(): number {
        return this.socketServer.getNetworkTime()
    }

    onCommand(data: any) {
        this.log.info(`received command message: `, data.command.type);

        if (data.command.type === 'interrupt') {
            if (data.command.data.id) {
                this.system.interruptById(data.command.data.id,() =>{
                    this.sendOkResponse(data);
                });
            }else{
              this.system.interruptAll(() => {
                  this.sendOkResponse(data);
              });
            }
        }

        let command = this.buildCommandHandler(data);
        if (!command){
            // @TODO probably in this case we would want to respond with an error
            this.sendOkResponse(data);
            return;
        }

        if (this.system.readyForCommand(command) || data.command.type === "lookAt3D") {
            this.system.runCommand(command);
        }
        else {
            this.sendBusyRespononse(data);
        }
    }

    buildCommandHandler(data: any): CommandHandler {

        switch (data.command.type) {
            case 'audio':
                return new AudioCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'image':
                return new ImageCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'hideImage':
                return new HideImageCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'stopAudio':
                return new StopAudioCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'asset':
                return new AssetCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'attention': //TODO create CommandHandler
                if (data.command.data.state) {
                    switch (data.command.data.state) {
                        case 'idle':
                            this.attentionIdle();
                            break;
                        case 'off':
                            this.attentionOff();
                            break;
                    }
                }
                this.sendOkResponse(data);
                break;
            case 'lookAt':
                return new LookAtCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'lookAt3D':
                return new LookAt3DCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'tts':
                return new TtsCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'animation':
                return new AnimationCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'mim':
                return new MimCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'photo':
                return new PhotoCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'stream':
                return new StreamCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'menu':
                return new MenuCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'ident':
                return new IdentCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'ringColour':
                return new SetColourRing(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'blink':
                return new BlinkCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            default:
                this.isReadyForCommand = true;
                break;
        }

        return null;
    }

    sendBusyRespononse(data: any): void {
        let responseMessage: ResponseMessage = {
            id: data.command.id,
            error: 'Rom skill is busy. Command ignored.',
            response: undefined,
            responseData: undefined,
            robotSerialName: data.robotSerialName,
            sendTime: data.sendTime,
            commandReceivedTime: ConnectionManager.instance.getNetworkTime(),
            commandCompletedTime: ConnectionManager.instance.getNetworkTime(),
            status: 'ERROR',
            type: data.command.type
        }
        ConnectionManager.instance.sendWebsocketMessage('transaction', responseMessage, 'BUSY');
    }

    sendOkResponse(data: any): void {
        let responseMessage: ResponseMessage = {
            id: data.command.id,
            error: undefined,
            response: undefined,
            responseData: undefined,
            robotSerialName: data.robotSerialName,
            sendTime: data.sendTime,
            commandReceivedTime: this.getNetworkTime(),
            commandCompletedTime: this.getNetworkTime(),
            status: 'OK',
            type: data.command.type
        }
        ConnectionManager.instance.sendWebsocketMessage('transaction', responseMessage, 'OK');
        this.isReadyForCommand = true;
    }

    onCommandHandlerCompleted(commandHandler: CommandHandler): void {
        this.log.info(`onCommandHandlerCompleted: ${commandHandler.type}:${commandHandler.id}`);
        this.system.finishCommand(commandHandler);
        commandHandler.dispose();
    }
}