import { EventEmitter } from 'events';
import ConnectionManager from '../connection/ConnectionManager';
import { CommandHandler, ResponseMessage } from './CommandHandler';
import BlinkCommandHandler from './BlinkCommandHandler';

import SuperSystem from './systems/SuperSystem';

export default class CommandManager extends EventEmitter {

    private static _instance: CommandManager;

    public log: Log;
    public isReadyForCommand = true;
    public system: SuperSystem;

    constructor() {
        super();
        this.init();
    }

    init() {
        this.log = parentLog.createChild('command-manager');
        this.attentionOff();
        this.system = new SuperSystem();
    }

    reset() {
        this.cleanup();
        this.init();
    }

    static get instance(): CommandManager {
        if (!CommandManager._instance) {
            CommandManager._instance = new CommandManager();
        }

        return CommandManager._instance;
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
            commandReceivedTime: ConnectionManager.instance.getNetworkTime(),
            commandCompletedTime: ConnectionManager.instance.getNetworkTime(),
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

    generateMenuConfig(commandData: any): any {
        let menuConfig: MenuConfig = new MenuConfig(commandData.menuTitle, commandData.menuItems);
        return menuConfig.config;
    }

    async attentionIdle() {
        // this.log.info("Attention: IDLE");
        await jibo.expression.setAttentionMode(jibo.expression.AttentionMode.IDLE);
    }

    async attentionOff() {
        // this.log.info("Attention: OFF");
        await jibo.expression.setAttentionMode(jibo.expression.AttentionMode.OFF);
    }


    cleanup() {
        this.system.interruptAll(() => {
            // TODO: How best to handle this...
            this.log = null;
        });
        this.system = null;
    }

    static dispose(): void {
        if (this._instance) {
            jibo.loader.unloadAll(jibo.loader.activeCache); // remove all assets
            this._instance.cleanup();
            this._instance = undefined;
        }
    }
}
