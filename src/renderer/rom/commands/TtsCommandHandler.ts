import { CommandHandler } from './CommandHandler';
import Log from '../../utils/Log';
import Hub from '../../skills/Hub';

export default class TtsCommandHandler extends CommandHandler {

    static  MAX_TTS_STRING_LENGTH: number = 256;

    public text: string;
    public blackboard: any;

    constructor(commandObj: any, parentLog: Log, callback: any) {
        super(commandObj, parentLog, 'tts', callback);
    }

    isValidCommand(commandObj: any): boolean {
        let valid: boolean = false;

        if (commandObj.data) {
            const text: string = commandObj.data.text || commandObj.data.prompt;
            if (text) {
                if (this.isValidTtsText(text)) {
                    this.text = text;
                    valid = true;
                } else {
                    this.error = 'Invalid tts text.';
                }
            } else {
                this.error = 'No tts text specified.';
            }
        } else {
            this.error = 'No command data.';
        }
        return valid;
    }

    isValidTtsText(ttsText: string): boolean {
        return ((typeof ttsText === "string") && (ttsText.length < TtsCommandHandler.MAX_TTS_STRING_LENGTH));
    }

    handleCommand(): void {
        this.log.info(`handleCommand`);
        Hub.Instance().startTTS(this.text);
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
