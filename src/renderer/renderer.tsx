import * as React from 'react';
import { render } from 'react-dom';
import Application from './components/Application';
import STTController from './STTController';
import TTSController from './TTSController';
import HotwordController, { HotwordResult } from './HotwordController';
import AsyncToken from './AsyncToken';
import MicrosoftSpeechController from './microsoft/MicrosoftSpeechController';
import BingSpeechApiController from './microsoft/BingSpeechApiController';
import BingTTSController from './microsoft/BingTTSController';
// import SnowboyController from './snowboy/SnowboyController';
import WwMusicController from './ww/WwMusicController';
import NLUController, { NLUIntentAndEntities } from './NLUController';
import LUISController from './microsoft/LUISController';
import Hub from './skills/Hub';
import TCPClientServer from './connection/TCPClientServer';


import * as PIXI from 'pixi.js'
import animate = require('pixi-animate');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const eyeClassPath = root + '/assets/eye/eye.js';
const basePath = root + '/assets/eye';
const eyeClass: any = require(eyeClassPath);
let eyeInstance: any = null;
const canvasElement: HTMLCanvasElement = document.getElementById("stage") as HTMLCanvasElement;

const audioContext = new AudioContext();
let server: TCPClientServer = startServer(9797);

let renderer = PIXI.autoDetectRenderer(1280, 720, {
    view: canvasElement,
    backgroundColor: 0x0,
    antialias: true
});

let stage: PIXI.Container = new PIXI.Container();
animate.load(eyeClass.library.eye, stage, loaderCallback as any, basePath);
function update() {
    renderer.render(stage);
    requestAnimationFrame(update);
}
update();

function loaderCallback(instance: any, loader: any):void {
    eyeInstance = instance;
    eyeInstance.gotoAndStop('idle');
    eyeInstance.eye.eye_blue.visible = false;

}
// import * as styles from '../../css/bootstrap.min.css';
// import * as styles2 from '../../css/bootstrap-theme.min.css';

/*
render(
    <Application/>,
    document.getElementById('app')
);
*/

function startServer(port: number): TCPClientServer {
    return new TCPClientServer(port);
}

function startTTS(prompt: string) {
    const ttsController: TTSController = new BingTTSController(audioContext);
    let t: AsyncToken<string> = ttsController.SynthesizerStart(prompt);

    t.on('Synthesizing', () => {
        //console.log(`renderer: startRecognizer: on Synthesizing`);
    });

    t.on('SynthesisEndedEvent', () => {
        //console.log(`renderer: startRecognizer: on SynthesisEndedEvent`);
    });

    t.complete
        .then((result: string) => {
            //console.log(`SYNTHESIS RESULT: ${result}`);
        })
        .catch((error: any) => {
            console.log(error);
        });
}

function startNLU(utterance: string) {
    const nluController: NLUController = new LUISController();

    let t: AsyncToken<NLUIntentAndEntities> = nluController.getIntentAndEntities(utterance);

    t.complete
        .then((intentAndEntities: NLUIntentAndEntities) => {
            console.log(`NLUIntentAndEntities: `, intentAndEntities);
            Hub.Instance().handleLaunchIntent(intentAndEntities, utterance);
        })
        .catch((error: any) => {
            console.log(error);
		});
}

function startRecognizer() {
	// const speechController: STTController = new MicrosoftSpeechController();
    const speechController: STTController = new BingSpeechApiController();
	let t: AsyncToken<string> = speechController.RecognizerStart({recordDuration: 3000});

    t.on('Listening', () => {
        //console.log(`renderer: startRecognizer: on Listening`);
    });

    t.on('RecognitionEndedEvent', () => {
        //console.log(`renderer: startRecognizer: on RecognitionEndedEvent`);
    });

    t.on('Recording_Stopped', () => {
        //console.log(`renderer: startRecognizer: on Recording_Stopped`);
        startHotword();
    });

    t.complete
        .then((utterance: string) => {
            console.log(`Utterance: ${utterance}`);
			startNLU(utterance);
        })
        .catch((error: any) => {
            console.log(error);
		});

}

function startHotword() {
    // const hotwordController: HotwordController = new SnowboyController();
    // let t: AsyncToken<HotwordResult> = hotwordController.RecognizerStart({sampleRate: 16000});
	// if (eyeInstance) {
	// 	eyeInstance.gotoAndPlay('blink');
	// 	eyeInstance.eye.eye_blue.visible = false;
	// }
    //
    //
    // t.on('Listening', () => {
    //     //console.log(`renderer: startHotword: on Listening`);
    // });
    //
    // t.on('hotword', () => {
    //     //console.log(`renderer: startHotword: on hotword: `, eyeInstance);
	// 	if (eyeInstance) {
	// 		eyeInstance.eye.eye_blue.visible = true;
	// 	}
    // });
    //
    // t.complete
    //     .then((result: HotwordResult) => {
    //         console.log(`HotWord: result:`, result);
    //         startRecognizer();
    //     })
    //     .catch((error: any) => {
    //         console.log(error);
    //     });
}

function startMusic() {
    const musicController = new WwMusicController();
}

function addButton(type: string, handler: any): void {

	var element = document.createElement("input");
	element.type = type;
	element.value = type;
	element.name = type;
	element.onclick = handler;
	var app = document.getElementById("app");
	app.appendChild(element);
}

addButton("Speech", startRecognizer);
addButton("Hotword", startHotword);
addButton("Music", startMusic);

function eyeIdle() {
	eyeInstance.gotoAndStop('idle');
    eyeInstance.eye.eye_blue.visible = false;
}

function eyeListen() {
	eyeInstance.gotoAndStop('idle');
	eyeInstance.eye.eye_blue.visible = true;
}

function eyeBlink() {
	eyeInstance.gotoAndPlay('blink');
}

function eyeLookLeft() {
	eyeInstance.gotoAndPlay('to_left');
}

function eyeLookRight() {
	eyeInstance.gotoAndPlay('to_right');
}

addButton("Idle", eyeIdle);
addButton("Listen", eyeListen);
addButton("Blink", eyeBlink);
addButton("LookLeft", eyeLookLeft);
addButton("LookRight", eyeLookRight);

startHotword();
