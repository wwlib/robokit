const record = require('node-record-lpcm16');
import { Detector, Models } from 'snowboy';
// import HotwordDetector from './HotwordDetector';
const path = require('path');
const findRoot = require('find-root');

const root = findRoot(__dirname);
const modelPath: string = path.resolve(root, 'resources/models/snowboy.umdl');
const commonResPath: string = path.resolve(root, 'resources/common.res');
console.log(modelPath);
console.log(commonResPath);

export default class SnowboyController {

	public models: Models
	public detector: Detector;
	public mic: any;

	constructor() {
		this.models = new Models();
		this.models.add({
		  file: modelPath,
		  sensitivity: '0.5',
		  hotwords : 'snowboy'
		});

		this.detector = new Detector({
		  resource: commonResPath,
		  models: this.models,
		  audioGain: 2.0,
		  applyFrontend: true
		});

		this.detector.on('silence', function () {
		  // console.log('silence');
		});

		this.detector.on('sound', function (buffer) {
		  // <buffer> contains the last chunk of the audio that triggers the "sound"
		  // event. It could be written to a wav stream.
		  // console.log('sound');
		});

		this.detector.on('error', function () {
		  console.log('error');
		});

		this.detector.on('hotword', function (index, hotword, buffer) {
		  // <buffer> contains the last chunk of the audio that triggers the "hotword"
		  // event. It could be written to a wav stream. You will have to use it
		  // together with the <buffer> in the "sound" event if you want to get audio
		  // data after the hotword.
		  console.log(buffer);
		  console.log('hotword', index, hotword);
		});

		this.mic = record.start({
		   threshold: 0,
		   sampleRate: 16000,
		   verbose: true,
		});

		this.mic.pipe(this.detector as any);

	}

}
