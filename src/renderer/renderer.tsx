import * as React from 'react';
import { render } from 'react-dom';
import Application from './components/Application';
import STTController from './STTController';
import AsyncToken from './AsyncToken';
import MicrosoftSpeechController from './microsoft/MicrosoftSpeechController';
import BingSpeechApiController from './microsoft/BingSpeechApiController';
import SnowboyController from './snowboy/SnowboyController';
import WwMusicController from './ww/WwMusicController';

// import * as styles from '../../css/bootstrap.min.css';
// import * as styles2 from '../../css/bootstrap-theme.min.css';

/*
render(
    <Application/>,
    document.getElementById('app')
);
*/

function startRecognizer() {
	// const speechController: STTController = new MicrosoftSpeechController();
    const speechController: STTController = new BingSpeechApiController();
	let t: AsyncToken = speechController.RecognizerStart({recordDuration: 3000});

    t.on('Listening', () => {
        console.log(`renderer: startRecognizer: on Listening`);
    });

    t.on('Listening_Recognizing', () => {
        console.log(`renderer: startRecognizer: on Listening_Recognizing`);
    });

    t.on('RecognitionEndedEvent', () => {
        console.log(`renderer: startRecognizer: on RecognitionEndedEvent`);
    });

    t.complete
        .then((result: string) => {
            console.log(`RESULT: ${result}`);
        })
        .catch((error: any) => {
            console.log(error);
            });

}

function startHotword() {
    const snowboyController = new SnowboyController();
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
