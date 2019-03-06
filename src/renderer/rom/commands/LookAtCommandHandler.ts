import { CommandHandler } from './CommandHandler';
import Log from '../../utils/Log';
import PixijsManager from '../../pixijs/PixijsManager';

export default class LookAtCommandHandler extends CommandHandler {

    public angle: number;

    constructor(commandObj: any, parentLog: Log, callback: any) {
        super(commandObj, parentLog, 'lookAt', callback);
    }

    isValidCommand(commandObj: any): boolean {
        let valid: boolean = false;

        if (commandObj.data && commandObj.data.angle) {
            valid = true;
            this.angle = commandObj.data.angle;
        } else {
            this.error = "No angle data."
        }

        return valid;
    }

    handleCommand(): void {
        this.log.info(`handleCommand:`, this.angle);
        if (this.angle > 0) {
            PixijsManager.Instance().eyeLookRight();
        } else if (this.angle < 0) {
            PixijsManager.Instance().eyeLookLeft();
        }
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
