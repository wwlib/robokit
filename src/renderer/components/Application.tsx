import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";

import MicrosoftSpeechController from '../microsoft/MicrosoftSpeechController';
import WwMusicController from '../ww/WwMusicController';
// import SnowboyController from '../snowboy/SnowboyController';
import STTController from '../STTController';
import AsyncToken from '../AsyncToken';

// const {shell} = require('electron').remote;
// const wwLogo = require('../../../assets/ww-logo-40.png')

export interface ApplicationProps { }
export interface ApplicationState { }

export default class Application extends React.Component < ApplicationProps, ApplicationState > {

    componentWillMount() {
        // this.setState({
        // });
    }

    componentDidMount() {
    }

    // onLogoClicked(): void {
    //     shell.openExternal('http://robocommander.io');
    // }

    onButtonClicked(action: string): void {
        // console.log(`onButtonClicked: ${action}`);
        switch (action) {
            case 'startSpeech':
                const microsoftSpeechController: STTController = new MicrosoftSpeechController();
                let t: AsyncToken = microsoftSpeechController.RecognizerStart();
                t.complete
                    .then((result: string) => {
                        console.log(`RESULT: ${result}`);
                    })
                    .catch((error: any) => {
                        console.log(error);
                    });
                break;
            case 'startMusic':
                const musicController = new WwMusicController();
                break;
            case 'startSnowboy':
                // const snowboyController = new SnowboyController();
                break;
        }
    }

    render() {
        return(
            <div>
                <ReactBootstrap.Button bsStyle={'success'} key={"startSpeech"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "startSpeech")}>Start Speech</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"startMusic"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "startMusic")}>Start Music</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"startSnowboy"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "startSnowboy")}>Start Snowboy</ReactBootstrap.Button>
            </div>
        );
    }
}
