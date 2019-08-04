
import { BingSpeechClient, VoiceRecognitionResponse } from 'bingspeech-api-client';
import ASRController from '../ASRController';
import AsyncToken from '../AsyncToken';
const findRoot = require('find-root');
const fs = require('fs');
const record = require('node-record-lpcm16');

const root = findRoot(__dirname);
const configFile = root + '/data/config.json';
const config: any = require(configFile);

export default class BingSpeechApiController extends ASRController {

    public client: BingSpeechClient;

    constructor() {
        super();
        this.client = new BingSpeechClient(config.Microsoft.AzureSpeechSubscriptionKey);
    }

    RecognizeWaveBuffer(wave: Buffer): AsyncToken<string> {
        let token = new AsyncToken<string>();
        token.complete = new Promise<string>((resolve: any, reject: any) => {
            this.client.recognize(wave).then((response: VoiceRecognitionResponse) => {
                //console.log(response);
                token.emit('RecognitionEndedEvent');
                let result: string = '';
                if (response && response.NBest && response.NBest[0] && response.NBest[0].Lexical) {
                    result = response.NBest[0].Lexical;
                }
                resolve(result);
            });
        });
        return token;
    }

    RecognizerStart(options: any): AsyncToken<string> {
        let recordDuration = 6000;
        if (options && options.recordDuration) {
            recordDuration = options.recordDuration;
        }
        //console.log(`BingSpeechApiController: RecognizerStart:`);
        let token = new AsyncToken<string>();
        token.complete = new Promise<string>((resolve: any, reject: any) => {
            process.nextTick(() => { token.emit('Listening'); });
            try {


                
                let liveStream = record
                    .start({
                        sampleRateHertz: 16000,
                        verbose: true,
                        recordProgram: 'rec'
                    })
                    .on('error', (error: any) => {
                        console.log(error);
                        reject(error);
                    });

                setTimeout(() => {
                    //console.log(`stopping`);
                    record.stop();
                    token.emit('Recording_Stopped');
                }, recordDuration);

                this.client.recognizeStream(liveStream).then((response: VoiceRecognitionResponse) => {
                    console.log(`response:`, response);
                    token.emit('RecognitionEndedEvent');
                    let result: string = '';
                    if (response && response.NBest && response.NBest[0] && response.NBest[0].Lexical) {
                        result = response.NBest[0].Lexical;
                    }
                    resolve(result);
                });
            } catch (error) {
                console.log(config.Microsoft.AzureSpeechSubscriptionKey);
                console.log(config.Microsoft);
                console.log(error);
            }
        });
        return token;
    }
}
