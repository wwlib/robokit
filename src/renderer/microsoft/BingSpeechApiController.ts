
import { BingSpeechClient, VoiceRecognitionResponse } from 'bingspeech-api-client';
import STTController from '../STTController';
import AsyncToken from '../AsyncToken';
const findRoot = require('find-root');
const fs = require('fs');
const record = require('node-record-lpcm16');

const root = findRoot(__dirname);
const configFile = root + '/data/config.json';
const config: any = require(configFile);

export default class BingSpeechApiController extends STTController{

    constructor() {
        super();
    }

    RecognizerStart(options: any): AsyncToken {
        let recordDuration = 6000;
        if (options && options.recordDuration) {
            recordDuration = options.recordDuration;
        }
        console.log(`BingSpeechApiController: RecognizerStart:`);
        let token = new AsyncToken();
        token.complete = new Promise<string>((resolve: any, reject: any) => {
            console.log(`LISTENING`);
            process.nextTick(() => {token.emit('Listening');})
            let client = new BingSpeechClient(config.Microsoft.BingSTTSubscriptionKey);
            let liveStream = record
                .start({
                    sampleRateHertz: 16000,
                    //thresholdStart: '0.5',
                    //thresholdEnd: '10.0',
                    verbose: true,
                    recordProgram: 'rec'
                })
                .on('error', (error: any) => {
                    console.log(error);
                    reject(error);
                });

            setTimeout(() => {
                console.log(`stopping`);
                token.emit('Listening_Recognizing');
                record.stop();
            }, recordDuration);

            client.recognizeStream(liveStream).then((response: any) => {
                // console.log(response.results[0].name);
                token.emit('RecognitionEndedEvent');
                let result = '';
                if (response && response.results && response.results[0] && response.results[0].name) {
                    result = response.results[0].name;
                }
                resolve(result);
            });
        });
        return token;
    }
}
