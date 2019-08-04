import ASRController from './ASRController';
//import TTSController from './TTSController';
import HotwordController, { HotwordResult } from './HotwordController';
import AsyncToken from './AsyncToken';
import BingSpeechApiController from './microsoft/BingSpeechApiController';
import BingTTSController from './microsoft/BingTTSController';
import SnowboyController from './snowboy/SnowboyController';
import WwMusicController from './ww/WwMusicController';
import NLUController, { NLUIntentAndEntities } from './NLUController';
import LUISController from './microsoft/LUISController';
import Hub from './skills/Hub';
import PixijsManager from './pixijs/PixijsManager';
import RomManager, { RomManagerOptions, RobotInfo } from './rom/RomManager';

PixijsManager.Instance().init();
PixijsManager.Instance().start();

const robotInfo: RobotInfo = {
    type: 'robokit',
    serialName: 'robokit'
}
const romManagerOptions: RomManagerOptions ={
    robotInfo: robotInfo
}
RomManager.Instance(romManagerOptions).init();

const audioContext = new AudioContext();

function startNLU(utterance: string) {
    const nluController: NLUController = new LUISController();

    let t: AsyncToken<NLUIntentAndEntities> = nluController.getIntentAndEntities(utterance);

    t.complete
        .then((intentAndEntities: NLUIntentAndEntities) => {
            console.log(`NLUIntentAndEntities: `, intentAndEntities);
            RomManager.Instance().onNLU(intentAndEntities, utterance);
            Hub.Instance().handleLaunchIntent(intentAndEntities, utterance);
        })
        .catch((error: any) => {
            console.log(error);
		});
}

function startRecognizer() {
    // const speechController: ASRController = new MicrosoftSpeechController();
    console.log(`@@@@@@@@ renderer: startRecognizer`);
    const speechController: ASRController = new BingSpeechApiController();
    console.log(`@@@@@@@@ renderer: startRecognizer: speechController.RecognizerStart`);
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
            RomManager.Instance().onUtterance(utterance);
            startNLU(utterance);
        })
        .catch((error: any) => {
            console.log(error);
		});

}

function startHotword() {
    const hotwordController: HotwordController = new SnowboyController();
    let t: AsyncToken<HotwordResult> = hotwordController.RecognizerStart({sampleRate: 16000});
    PixijsManager.Instance().eyeBlink();
    PixijsManager.Instance().eyeShowHighlight(false);

    t.on('Listening', () => {
        //console.log(`renderer: startHotword: on Listening`);
    });

    t.on('hotword', () => {
        //console.log(`renderer: startHotword: on hotword: `, eyeInstance);
        PixijsManager.Instance().eyeShowHighlight();
        RomManager.Instance().onHotword();
    });

    t.complete
        .then((result: HotwordResult) => {
            console.log(`HotWord: result:`, result);
            startRecognizer();
        })
        .catch((error: any) => {
            console.log(error);
        });
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
    PixijsManager.Instance().eyeIdle();
    PixijsManager.Instance().eyeShowHighlight(false);
}

function eyeListen() {
	PixijsManager.Instance().eyeIdle();
    PixijsManager.Instance().eyeShowHighlight();
}

function eyeBlink() {
    PixijsManager.Instance().eyeBlink();
}

function eyeLookLeft() {
    PixijsManager.Instance().eyeLookLeft();
}

function eyeLookRight() {
    PixijsManager.Instance().eyeLookRight();
}

addButton("Idle", eyeIdle);
addButton("Listen", eyeListen);
addButton("Blink", eyeBlink);
addButton("LookLeft", eyeLookLeft);
addButton("LookRight", eyeLookRight);

startHotword();

// Start Remote Operation Mode Server
RomManager.Instance().start();