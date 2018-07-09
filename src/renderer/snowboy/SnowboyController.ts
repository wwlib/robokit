import * as record from 'node-record-lpcm16';
import HotwordDetector from './HotwordDetector';

export default class SnowboyController {
	
	public detector: HotwordDetector;
	public mic: any;

	constructor() {

		this.detector = new HotwordDetector();
		this.mic = record.start({
		   threshold: 0,
		   sampleRate: 16000,
		   verbose: true,
		});

		this.mic.pipe(this.detector as any);
	
	}

}
