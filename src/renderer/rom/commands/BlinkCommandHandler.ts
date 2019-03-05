import { CommandHandler } from './CommandHandler';
import Log = require('jibo-log');
import jibo = require('jibo');
import Resource from './Resources';

export default class BlinkCommandHandler extends CommandHandler {

    get resources(): Resource[] {
        return [ Resource.SCREEN, ];
    }

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
        jibo.expression.blink();
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
