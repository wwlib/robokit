import * as React from 'react';
import { render } from 'react-dom';
import Application from './components/Application';
import MicrosoftSpeechController from './microsoft/MicrosoftSpeechController';
import SnowboyController from './snowboy/SnowboyController';

// import * as styles from '../../css/bootstrap.min.css';
// import * as styles2 from '../../css/bootstrap-theme.min.css';

/*
render(
    <Application/>,
    document.getElementById('app')
);
*/

function startRecognizer() {
	const microsoftSpeechController = new MicrosoftSpeechController();
	microsoftSpeechController.RecognizerStart()
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
