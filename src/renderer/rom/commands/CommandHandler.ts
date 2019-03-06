import RomManager from '../RomManager';
import Log from '../../utils/Log';

export interface ResponseMessage {
    id: string;
    error?: string;
    response: string;
    responseData?: any;
    robotSerialName: string;
    sendTime: number;
    commandReceivedTime: number;
    commandCompletedTime: number;
    status: string;
    type: string;
}

export abstract class CommandHandler {

    public log: Log;
    public id: string;
    public robotSerialName: string;
    public sendTime: number;
    public commandReceivedTime: number;
    public commandCompletedTime: number;
    public type: string;

    public status: string = '';
    public error: string;
    public callback: any;
    public interrupted: boolean = false;

    constructor(commandObj: any, parentLog: Log, logName: string, callback: any) {
        this.log = parentLog.createChild(logName);
        this.callback = callback;
        this.commandReceivedTime = RomManager.Instance().getNetworkTime();

        if (commandObj) {
            this.id = commandObj.id;
            this.robotSerialName = commandObj.robotSerialName;
            this.sendTime = commandObj.sendTime;
            this.type = commandObj.type;

            if (this.isValidCommand(commandObj)) {
                this.handleCommand();
            } else {
                this.status = 'ERROR';
                this.onCompleted();
            }
        } else {
            this.status = 'ERROR';
            this.error = 'Command object is null or undefined';
            this.onCompleted();
        }
    }

    abstract isValidCommand(commandObj: any): boolean;

    abstract handleCommand(): void;

    abstract interrupt(done: any): void;

    onCompleted(response?: string, responseData?: any): void {
        this.commandCompletedTime = RomManager.Instance().getNetworkTime();
        this.sendResponse(response, responseData);
        if (this.callback) {
            this.callback(this);
        }
    }

    sendResponse(response?: string, responseData?: any): void {
        let responseMessage: ResponseMessage = {
            id: this.id,
            error: this.error,
            response: response,
            responseData: responseData,
            robotSerialName: this.robotSerialName,
            sendTime: this.sendTime,
            commandReceivedTime: this.commandReceivedTime,
            commandCompletedTime: this.commandCompletedTime,
            status: this.status,
            type: this.type
        }
        RomManager.Instance().sendTransactionResponse(responseMessage);
    }

    dispose(): void {
        this.log = null;
        this.callback = null;
    }
}
