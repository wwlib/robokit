const record = require('node-record-lpcm16');
import { Detector, Models } from 'snowboy';
import { HotwordController, HotwordResult } from 'cognitiveserviceslib';
import { AsyncToken } from 'cognitiveserviceslib';
const path = require('path');
const findRoot = require('find-root');

const root = findRoot(__dirname);
const modelPath: string = path.resolve(root, 'resources/models/HeyRobo.pmdl'); // snowboy.umdl
const commonResPath: string = path.resolve(root, 'resources/common.res');
console.log(modelPath);
console.log(commonResPath);

export default class SnowboyController extends HotwordController {

	public models: Models
	public detector: Detector;
	public mic: any;

	private _token: AsyncToken<HotwordResult> | undefined;
	private _onHotwordHandler: any = this.onHotword.bind(this);

	constructor() {
		super();
		this.models = new Models();
		this.models.add({
			file: modelPath,
			sensitivity: '0.5',
			hotwords: 'snowboy'
		});
	}

	onHotword(index, hotword, buffer) {
		// <buffer> contains the last chunk of the audio that triggers the "hotword"
		// event. It could be written to a wav stream. You will have to use it
		// together with the <buffer> in the "sound" event if you want to get audio
		// data after the hotword.
		record.stop();
		this._token.emit('hotword');
		this._token.resolve({ hotword: hotword, index: index, buffer: buffer });
	}

	RecognizerStart(options: any): AsyncToken<HotwordResult> {
		let sampleRate = 16000;
		if (options && options.sampleRate) {
			sampleRate = options.sampleRate;
		}
		// console.log(`SnowboyController: RecognizerStart:`);
		this._token = new AsyncToken<HotwordResult>();
		this._token.complete = new Promise<HotwordResult>((resolve: any, reject: any) => {
			process.nextTick(() => { this._token.emit('Listening'); });

			this._token.resolve = resolve;
			this._token.reject = reject;

			this.detector = new Detector({
				resource: commonResPath,
				models: this.models,
				audioGain: 2.0,
				applyFrontend: true
			});

			// this.detector.on('silence', () => {
			// 	// console.log('silence');
			// 	this._token.emit('silence');
			// });

			// this.detector.on('sound', (buffer) => {
			// 	// <buffer> contains the last chunk of the audio that triggers the "sound"
			// 	// event. It could be written to a wav stream.
			// 	// console.log('sound');
			// 	this._token.emit('sound');
			// });

			// this.detector.on('error', (error: any) => {
			// 	console.log('error', error);
			// 	reject(error);
			// });

			this.detector.on('hotword', this._onHotwordHandler);

			this.mic = record.start({
				threshold: 0,
				sampleRate: sampleRate,
				verbose: true,
			});

			this.mic.pipe(this.detector as any);
		});

		return this._token;
	}

	force() {
		record.stop();
		this.detector.removeAllListeners();
		this._token.emit('hotword');
		if (this._token.resolve) {
			this._token.resolve();
		}
	}

	dispose() {
		record.stop();
		this.models = undefined;
		this.detector.removeAllListeners();
		this.detector = undefined
		this.mic = undefined;
		this._token.dispose();
		this._token = undefined;
	}

}
