import {
    AsyncToken,
    ASRController,
    ASRResponse,
    AzureSpeechApiController,
    NLUController,
    NLUIntentAndEntities,
    LUISController,
    AzureTTSController,
    HotwordController,
    HotwordResult,
} from 'cognitiveserviceslib';

import SnowboyController from './snowboy/SnowboyController';
import WwMusicController from './ww/WwMusicController';
import Hub from './skills/Hub';
import PixijsManager from './pixijs/PixijsManager';
import RomManager, { RomManagerOptions, RobotInfo } from './rom/RomManager';

const config = require('../../data/config.json');

PixijsManager.Instance().init();
PixijsManager.Instance().start();
Hub.Instance({ config: config });

const robotInfo: RobotInfo = {
    type: 'robokit',
    serialName: 'robokit'
}
const romManagerOptions: RomManagerOptions = {
    robotInfo: robotInfo
}
RomManager.Instance(romManagerOptions).init();

const audioContext = new AudioContext();

let timeLog = {
    timeStart: 0,
    recordingStopped: 0,
    timeToRecordingStopped: 0,
    recognitionEnded: 0,
    timeToRecognitionEnded: 0,
    skillLaunch: 0,
    timeToSkillLaunch: 0
}

function startNLU(utterance: string) {
    const nluController: NLUController = new LUISController(config);

    let t: AsyncToken<NLUIntentAndEntities> = nluController.getIntentAndEntities(utterance);

    t.complete
        .then((intentAndEntities: NLUIntentAndEntities) => {
            timeLog.skillLaunch = new Date().getTime();
            timeLog.timeToSkillLaunch = timeLog.skillLaunch - timeLog.timeStart;
            console.log(`NLUIntentAndEntities: `, intentAndEntities);
            console.log(`timeLog:`, JSON.stringify(timeLog, null, 2));
            RomManager.Instance().onNLU(intentAndEntities, utterance);
            Hub.Instance().handleLaunchIntent(intentAndEntities, utterance);
        })
        .catch((error: any) => {
            console.log(error);
        });
}

function startRecognizer() {
    // const speechController: ASRController = new MicrosoftSpeechController();
    timeLog = {
        timeStart: new Date().getTime(),
        recordingStopped: 0,
        timeToRecordingStopped: 0,
        recognitionEnded: 0,
        timeToRecognitionEnded: 0,
        skillLaunch: 0,
        timeToSkillLaunch: 0
    }
    console.log(`@@@@@@@@ renderer: startRecognizer`);
    const speechController: ASRController = new AzureSpeechApiController(config);
    console.log(`@@@@@@@@ renderer: startRecognizer: speechController.RecognizerStart`);
    let t: AsyncToken<ASRResponse> = speechController.RecognizerStart({ recordDuration: 3000 });

    t.on('Listening', () => {
        //console.log(`renderer: startRecognizer: on Listening`);
    });

    t.on('RecognitionEndedEvent', () => {
        //console.log(`renderer: startRecognizer: on RecognitionEndedEvent`);
        timeLog.recognitionEnded = new Date().getTime();
        timeLog.timeToRecognitionEnded = timeLog.recognitionEnded - timeLog.timeStart;
    });

    t.on('Recording_Stopped', () => {
        //console.log(`renderer: startRecognizer: on Recording_Stopped`);
        timeLog.recordingStopped = new Date().getTime();
        timeLog.timeToRecordingStopped = timeLog.recordingStopped - timeLog.timeStart;
        startHotword();
    });

    t.complete
        .then((asrResponse: ASRResponse) => {
            console.log(`Utterance: ${asrResponse.utterance}`);
            RomManager.Instance().onUtterance(asrResponse.utterance);
            startNLU(asrResponse.utterance);
        })
        .catch((error: any) => {
            console.log(error);
        });

}

function startHotword() {
    const hotwordController: HotwordController = new SnowboyController();
    let t: AsyncToken<HotwordResult> = hotwordController.RecognizerStart({ sampleRate: 16000 });
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