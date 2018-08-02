
import { BingSpeechClient, VoiceRecognitionResponse } from 'bingspeech-api-client';
import TTSController from '../TTSController';
import AsyncToken from '../AsyncToken';
const findRoot = require('find-root');
const fs = require('fs');

const root = findRoot(__dirname);
const configFile = root + '/data/config.json';
const config: any = require(configFile);

export default class BingTTSController extends TTSController{

    public audioContext: AudioContext;
    public masterVolumeGainNode: GainNode;

    constructor(audioContext: AudioContext) {
        super();

        this.audioContext = audioContext;
        this.masterVolumeGainNode = this.audioContext.createGain();
        this.masterVolumeGainNode.gain.value = 1.0;
        this.masterVolumeGainNode.connect(this.audioContext.destination);
    }

    SynthesizerStart(text: string, options?: any): AsyncToken<string> {
        //console.log(`BingTTSController: SynthesizerStart: ${text}`);
        let token = new AsyncToken<string>();
        token.complete = new Promise<string>((resolve: any, reject: any) => {
            process.nextTick(() => {token.emit('Synthesizing');});
            let client = new BingSpeechClient(config.Microsoft.BingSTTSubscriptionKey);
            let file = fs.createWriteStream('tts-out.wav');
            client.synthesizeStream(text).then(audioStream => {
                token.emit('SynthesisEndedEvent');
                audioStream.pipe(file);

                let buffers: any[] = [];
                audioStream.on('data', (chunk: any) => {
                  buffers.push(chunk);
                });
                audioStream.on('end', () => {
                    // console.log('audioStream end');
                    if (buffers && buffers.length > 0) {
                        let audioStreamBuffer = Buffer.concat(buffers);
                        let audioData = new Uint8Array(audioStreamBuffer).buffer;
                        this.audioContext.decodeAudioData(audioData, (buffer: any) => {
                            let decodedBuffer = buffer;
                            let bufferSource = this.audioContext.createBufferSource();
                            bufferSource.buffer = decodedBuffer;
                            bufferSource.connect(this.masterVolumeGainNode);
                            bufferSource.start(this.audioContext.currentTime);
                        });
                    }
                    resolve(text);
                });
            });
        });
        return token;
    }
}
