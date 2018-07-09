import { Detector, Models } from 'snowboy';
const path = require('path');
const findRoot = require('find-root');

const root = findRoot(__dirname);
const commonResPath: string = path.resolve(root, '/resources/common.res')

export default class HotwordDetector extends Detector {

	constructor(models: Models) {
		super({
	           resource: commonResPath,
	           models: models,
	           audioGain: 2.0,
		});
		this.setUp();
	}

	private setUp(): void {
	   this.on("silence", () => {
	      // handle silent state
		console.log("silence");
	   });

	   this.on("sound", () => {
	      // handle sound detected state
		console.log("sound");
	   });

	   this.on("error", (error) => {
	      // handle error
		console.log("error", error);
	   });

	   this.on("hotword", (index, hotword) => {
	      // hotword detected
		console.log("hotword");
	   });
	}

}
