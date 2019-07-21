import {EventEmitter} from "events";
import SocketServer, { Message } from './SocketServer';
import { NLUIntentAndEntities } from '../NLUController';
import { CommandHandler, ResponseMessage } from './commands/CommandHandler';
import TtsCommandHandler from './commands/TtsCommandHandler';
import IdentCommandHandler from './commands/IdentCommandHandler';
import BlinkCommandHandler from './commands/BlinkCommandHandler';
import LookAtCommandHandler from './commands/LookAtCommandHandler';
import ListenCommandHandler from './commands/ListenCommandHandler';
import Log from '../utils/Log';
import parentLog from '../log';
import Hub from '../skills/Hub';

export type RobotInfo = {
    type: string;
    serialName: string;
    ip?: string;
    port?: number;
}

export type RomEventData = {
    event: string;
    data?: any;
}

export type RomManagerOptions = {
    robotInfo: RobotInfo
}

// Remote Operation Mode Manager
export default class RomManager extends EventEmitter {

    private static _instance: RomManager;

    public log: Log;
    public socketServer: SocketServer;
    public isReadyForCommand = true;
    public robotInfo: RobotInfo;
    
    // private _onMessageHandler: any = this.onMessage.bind(this);
    private _onCommandHandler: any = this.onCommand.bind(this);

    constructor(options?: RomManagerOptions) {
        super ();
        if (options) {
            this.robotInfo = options.robotInfo;
        }
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
        console.log(`RomManager: start`);
        this.socketServer = new SocketServer();
        this.robotInfo.ip = this.socketServer.host;
        this.robotInfo.port = this.socketServer.port;
        this.socketServer.on('transaction', this._onCommandHandler);
    }

    onHotword(): void {
        const data: RomEventData = {
            event: 'hotword'
        }
        this.sendRomEventMessage(data);
    }

    onUtterance(utterance: string): void {
        const data: RomEventData = {
            event: 'utterance',
            data: utterance
        }
        this.sendRomEventMessage(data);
    }

    onNLU(intentAndEntities: NLUIntentAndEntities, utterance: string): void {
        const data: RomEventData = {
            event: 'nlu',
            data: {
                intentAndEntities: intentAndEntities,
                utterance: utterance
            }
        }
        this.sendRomEventMessage(data);
    }

    sendRomEventMessage(data: RomEventData): void {
        if (this.socketServer) {
            let currentTime: number = new Date().getTime();
            let message: Message = {
                client: 'robokit',
                id: -1,
                type: 'rom-event',
                sendTime: currentTime,
                status: 'OK',
                data: data
            }
            this.socketServer.broadcastMessage(message);
        }
    }

    sendTransactionResponse(responseMessage: ResponseMessage, status?: string): void {
        status = status || 'OK';
        let robotSerialName: string = 'NA';
        if (this.robotInfo) {
            robotSerialName = this.robotInfo.serialName;
        }
        responseMessage.robotSerialName = robotSerialName;
        let message: any = {
            type: 'transaction',
            status: status,
            data: responseMessage
        };
        this.socketServer.broadcastMessage(message);
    }

    getNetworkTime(): number {
        return this.socketServer.getNetworkTime()
    }

    onCommand(data: any) {
        this.log.info(`received command message: `, data.command.type, data);
        if (data.command.type === 'interrupt') {
            // TODO
        } else {
            let command = this.buildCommandHandler(data);
            if (!command){
                // TODO respond with an error
                this.sendOkResponse(data);
            }
        }
    }

    buildCommandHandler(data: any): CommandHandler {

        switch (data.command.type) {
            case 'tts':
                return new TtsCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'ident':
                return new IdentCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'blink':
                return new BlinkCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'lookAt':
                return new LookAtCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
            case 'listen':
                // Hub.Instance().startRecognizer();
                console.log(`LISTEN`);
                return null
                // return new ListenCommandHandler(data.command, this.log, this.onCommandHandlerCompleted.bind(this));
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
            commandReceivedTime: this.getNetworkTime(),
            commandCompletedTime: this.getNetworkTime(),
            status: 'ERROR',
            type: data.command.type
        }
        this.sendTransactionResponse(responseMessage, 'BUSY');
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
        this.sendTransactionResponse(responseMessage, 'OK');
        this.isReadyForCommand = true;
    }

    onCommandHandlerCompleted(commandHandler: CommandHandler): void {
        this.log.info(`onCommandHandlerCompleted: ${commandHandler.type}:${commandHandler.id}`);
        commandHandler.dispose();
    }
}