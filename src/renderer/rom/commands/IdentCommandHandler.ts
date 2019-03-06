import { CommandHandler } from './CommandHandler';
import Log from '../../utils/Log';
import RomManager from '../RomManager';
import PixijsManager from '../../pixijs/PixijsManager';

export default class IdentCommandHandler extends CommandHandler {

    public sendTime: number;
    public targetStartOffset: any;
    public targetStartTime: any;

    constructor(commandObj: any, parentLog: Log, callback: any) {
        super(commandObj, parentLog, 'ident', callback);
    }

    isValidCommand(commandObj: any): boolean {
        let valid: boolean = false;

        if (commandObj.sendTime && (typeof commandObj.sendTime === "number")) {
            this.sendTime = commandObj.sendTime;
            if (commandObj.data) {
                if (commandObj.data.targetStartOffset) {
                    if (this.isValidTargetStartOffset(commandObj.data.targetStartOffset)) {
                        this.targetStartOffset = commandObj.data.targetStartOffset;
                        this.targetStartTime = this.sendTime + this.targetStartOffset;
                        valid = true;
                    } else {
                        this.error = 'Invalid target start offset';
                    }
                } else {
                    this.error = 'No ident data specified';
                }
            } else {
                this.error = 'No command data';
            }
        } else {
            this.error = 'sendTime is not specified';
        }
        return valid;
    }

    isValidTargetStartOffset(targetStartOffset: number): boolean {
        let valid = true;
        valid = (typeof targetStartOffset === "number") &&
            (targetStartOffset <= 3000) &&
            (targetStartOffset >= 0)

        return valid; // TODO
    }

    handleCommand(): void {
        let currentTime: number = RomManager.Instance().getNetworkTime();
        let timeoutInterval: number = this.targetStartTime - currentTime;
        this.log.info(`handleCommand at: ${timeoutInterval}`);

        // schedule the action so that all robots ident simultaneously (clock-sync'd)
        setTimeout(() => {
            // TODO  - blink for now
            PixijsManager.Instance().eyeBlink();
            this.log.info(`handleCommand completed`);
        }, timeoutInterval);
    }

    onCompleted(): void {
        this.log.info(`onCompleted`);
        this.status = 'OK';
        super.onCompleted();
    }

    interrupt(done: any): void {
        this.log.info('interrupt');
        done();
    }

    dispose(): void {
        super.dispose();
    }
}
