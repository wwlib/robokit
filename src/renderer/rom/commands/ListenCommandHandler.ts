import { CommandHandler } from './CommandHandler';
import Log from '../../utils/Log';
import PixijsManager from '../../pixijs/PixijsManager';

export default class ListenCommandHandler extends CommandHandler {

    constructor(commandObj: any, parentLog: Log, callback: any) {
        super(commandObj, parentLog, 'blink', callback);
    }

    isValidCommand(commandObj: any): boolean {
        let valid: boolean = false;

        if (commandObj.data) {
            valid = true;
        }

        return valid;
    }

    handleCommand(): void {
        this.log.info(`handleCommand:`);
        // TODO start listening...
        this.onCompleted();
    }

    onCompleted(response?: string, responseData?: any): void {
        if (this.interrupted) {
            this.status = 'INTERRUPTED';
        } else {
            this.status = 'OK';
        }
        super.onCompleted(response, responseData);
    }

    interrupt(done: any): void {
        this.log.info('interrupt');
        this.interrupted = true;
    }

    dispose(): void {
        super.dispose();
    }
}
