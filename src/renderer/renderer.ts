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

function addButton(type: string, handler: any): void {

	var element = document.createElement("input");
	element.type = type;
	element.value = type;
	element.name = type;
	element.onclick = handler;
	var app = document.getElementById("app");
	app.appendChild(element);
}

function startRecognizer() {
    Hub.Instance().startRecognizer();
}

function startHotword() {
    Hub.Instance().startHotword();
}

function startMusic() {
    Hub.Instance().startMusic();
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

// Start Remote Operation Mode Server
RomManager.Instance().start();

Hub.Instance().init();
// Hub.Instance().startHotword();