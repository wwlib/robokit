import {EventEmitter} from "events";
import SocketServer, { Message, MessagePayload } from './SocketServer';
import { NLUIntentAndEntities } from '../NLUController';

export type RomManagerOptions = {

}

// Remote Operation Mode Manager
export default class RomManager extends EventEmitter {

    private static _instance: RomManager;

    public socketServer: SocketServer;
    
    private _onMessageHandler: any = this.onMessage.bind(this);

    constructor(options?: RomManagerOptions) {
        super ();
    }

    static Instance(options?: RomManagerOptions)
    {
        return this._instance || (this._instance = new this(options));
    }

    init(): void {
       
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
}