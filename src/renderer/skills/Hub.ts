import { EventEmitter } from "events";
import Skill from './Skill';
import SnowboyController from '../snowboy/SnowboyController';
import PixijsManager from '../pixijs/PixijsManager';
import RomManager from '../rom/RomManager';
import WwMusicController from '../ww/WwMusicController';

import {
    AsyncToken,
    NLUController,
    NLUIntentAndEntities,
    LUISController,
    TTSController,
    TTSResponse,
    AzureTTSController,
    HotwordController,
    HotwordResult,
    ASRController,
    ASRResponse,
    AzureSpeechApiController,
} from 'cognitiveserviceslib';
import ClockSkill from './ClockSkill';
import JokeSkill from './JokeSkill';
import FavoriteRobotSkill from './FavoriteRobotSkill';

export type HubOptions = {
    config: any
}

export enum HubState {
    OFF = "OFF",
    HOTWORD = "HOTWORD",
    RECOGNIZER = "RECOGNIZER",
    NLU = "NLU",
    SKILL = "SKILL"
}

export default class Hub extends EventEmitter {

    private static _instance: Hub;

    public state: HubState;
    public skillMap: Map<string, Skill | undefined>;
    public launchIntentMap: Map<string, Skill | undefined>;
    public luisController: LUISController;
    public tickInterval: any;
    public startTickTime: number;
    public previousTickTime: number;
    public audioContext: AudioContext;

    // private _startHotword: any = this.startHotword.bind(this);
    // private _startRecognizer: any = this.startRecognizer.bind(this);

    private _config: any;
    private _timeLog = {
        timeStart: 0,
        recordingStopped: 0,
        timeToRecordingStopped: 0,
        recognitionEnded: 0,
        timeToRecognitionEnded: 0,
        skillLaunch: 0,
        timeToSkillLaunch: 0
    }
    private _musicController: WwMusicController;

    constructor(options?: HubOptions) {
        super ();
        console.log(`HUB: CONSTRUCTOR!!`);
        this.skillMap = new Map<string, Skill>();
        this.launchIntentMap = new Map<string, Skill>();
        this.audioContext = new AudioContext();
        this._config = options.config;
        this.luisController = new LUISController(this._config)
        this.registerSkill(new JokeSkill());
        this.registerSkill(new ClockSkill());
        this.registerSkill(new FavoriteRobotSkill());
        this.startTickTime = new Date().getTime();
        this.previousTickTime = this.startTickTime;
        // TODO
        // this.tickInterval = setInterval(this.tick.bind(this), 1000);
        this.state = HubState.OFF;
    }

    static Instance(options?: HubOptions) {
        return this._instance || (this._instance = new this(options));
    }

    init(): void {
        process.nextTick(() => {
            Hub.Instance().startHotword()
        })
    }

    tick(): void {
        this.skillMap.forEach((skill: Skill | undefined, key: string) => {
            if (skill && skill.running) {
                let time: number = new Date().getTime();
                let frameTime: number = time - this.previousTickTime;
                let elapsedTime: number = time - this.startTickTime;
                skill.tick(frameTime, elapsedTime);
            }
        });
    }


    registerSkill(skill: Skill): void {
        console.log(`HUB: registerSkill: `, skill);
        this.skillMap.set(skill.id, skill);
        this.launchIntentMap.set(skill.launchIntent, skill);
    }

    removeSkill(skill: Skill): void {
        this.skillMap.set(skill.id, undefined);
        this.skillMap.delete(skill.id);
    }

    handleLaunchIntent(intentAndEntities: NLUIntentAndEntities, utterance: string): void {
        let launchIntent = intentAndEntities.intent;
        let skill: Skill | undefined = this.launchIntentMap.get(launchIntent);
        if (skill) {
            skill.launch(intentAndEntities, utterance);
            skill.running = true;
        }
    }

    startTTS(prompt: string) {
        const ttsController: TTSController = new AzureTTSController(this._config, this.audioContext);
        let t: AsyncToken<TTSResponse> = ttsController.SynthesizerStart(prompt, {autoPlay: true});
        let timeLog = {
            timeStart: new Date().getTime(),
            synthesisStreamStarted: 0,
            timeToSynthesisStreamStarted: 0,
            synthesisStreamEnded: 0,
            timeToSynthesisStreamEnded: 0,
        }
        t.on('Synthesizing', () => {
            // console.log(`renderer: startRecognizer: on Synthesizing`);
        });

        t.on('SynthesisStreamStartedEvent', () => {
            // console.log(`renderer: startRecognizer: on SynthesisEndedEvent`);
            timeLog.synthesisStreamStarted = new Date().getTime();
            timeLog.timeToSynthesisStreamStarted = timeLog.synthesisStreamStarted - timeLog.timeStart;
        });

        t.on('SynthesisStreamEndedEvent', () => {
            // console.log(`renderer: startRecognizer: on SynthesisEndedEvent`);
            timeLog.synthesisStreamEnded = new Date().getTime();
            timeLog.timeToSynthesisStreamEnded = timeLog.synthesisStreamEnded - timeLog.timeStart;
        });

        t.complete
            .then((ttsResponse: TTSResponse) => {
                // console.log(`SYNTHESIS RESULT: ${ttsResponse.buffer}`);
                console.log(`Hub: startTTS: timeLog:`, JSON.stringify(timeLog, null, 2));
                t.dispose();
            })
            .catch((error: any) => {
                console.log(error);
                t.dispose();
            });
    }

    startNLU(utterance: string) {
        const nluController: NLUController = new LUISController(this._config);
    
        let t: AsyncToken<NLUIntentAndEntities> = nluController.getIntentAndEntities(utterance);
    
        t.complete
            .then((intentAndEntities: NLUIntentAndEntities) => {
                this._timeLog.skillLaunch = new Date().getTime();
                this._timeLog.timeToSkillLaunch = this._timeLog.skillLaunch - this._timeLog.timeStart;
                console.log(`NLUIntentAndEntities: `, intentAndEntities);
                console.log(`timeLog:`, JSON.stringify(this._timeLog, null, 2));
                RomManager.Instance().onNLU(intentAndEntities, utterance);
                Hub.Instance().handleLaunchIntent(intentAndEntities, utterance);
                t.dispose();
            })
            .catch((error: any) => {
                console.log(error);
                t.dispose();
            });
    }

    startRecognizer() {
        this.state = HubState.RECOGNIZER;
        // process.nextTick(() => {
        //     PixijsManager.Instance().eyeShowHighlight();
        //     Hub.Instance().startHotword();
        // })
        PixijsManager.Instance().eyeShowHighlight();
        setTimeout(() => {
            process.nextTick(() => {
                this.state = HubState.OFF;
                Hub.Instance().startHotword()
            });
        }, 1000);
        // const speechController: STTController = new BingSpeechApiController();
        // let t: AsyncToken<string> = speechController.RecognizerStart({recordDuration: 3000});
    
        // t.on('Listening', () => {
        //     //console.log(`renderer: startRecognizer: on Listening`);
        // });
    
        // t.on('RecognitionEndedEvent', () => {
        //     //console.log(`renderer: startRecognizer: on RecognitionEndedEvent`);
        // });
    
        // t.on('Recording_Stopped', () => {
        //     //console.log(`renderer: startRecognizer: on Recording_Stopped`);
        //     this.startHotword();
        // });
    
        // t.complete
        //     .then((utterance: string) => {
        //         console.log(`Utterance: ${utterance}`);
        //         if (utterance) {
        //             RomManager.Instance().onUtterance(utterance);
        //             // this.startNLU(utterance);
        //             process.nextTick(() => this._startNLU(utterance)); 
        //         }
        //        t.dispose();
        //     })
        //     .catch((error: any) => {
        //         console.log(error);
        //        t.dispose();
        //     });
    
    }
/*
    startRecognizer() {
        // const speechController: ASRController = new MicrosoftSpeechController();
        this._timeLog = {
            timeStart: new Date().getTime(),
            recordingStopped: 0,
            timeToRecordingStopped: 0,
            recognitionEnded: 0,
            timeToRecognitionEnded: 0,
            skillLaunch: 0,
            timeToSkillLaunch: 0
        }
        console.log(`@@@@@@@@ renderer: startRecognizer`);
        const speechController: ASRController = new AzureSpeechApiController(this._config);
        console.log(`@@@@@@@@ renderer: startRecognizer: speechController.RecognizerStart`);
        let t: AsyncToken<ASRResponse> = speechController.RecognizerStart({ recordDuration: 3000 });
    
        t.on('Listening', () => {
            //console.log(`renderer: startRecognizer: on Listening`);
        });
    
        t.on('RecognitionEndedEvent', () => {
            //console.log(`renderer: startRecognizer: on RecognitionEndedEvent`);
            this._timeLog.recognitionEnded = new Date().getTime();
            this._timeLog.timeToRecognitionEnded = this._timeLog.recognitionEnded - this._timeLog.timeStart;
        });
    
        t.on('Recording_Stopped', () => {
            //console.log(`renderer: startRecognizer: on Recording_Stopped`);
            this._timeLog.recordingStopped = new Date().getTime();
            this._timeLog.timeToRecordingStopped = this._timeLog.recordingStopped - this._timeLog.timeStart;
            Hub.Instance().startHotword();
        });
    
        t.complete
            .then((asrResponse: ASRResponse) => {
                console.log(`Utterance: ${asrResponse.utterance}`);
                RomManager.Instance().onUtterance(asrResponse.utterance);
                Hub.Instance().startNLU(asrResponse.utterance);
            })
            .catch((error: any) => {
                console.log(error);
            });
    
    }
*/
    startHotword() {
        console.log(`START HOTWORD`);
        console.trace();
        this.state = HubState.HOTWORD;
        const hotwordController: HotwordController = new SnowboyController();
        let t: AsyncToken<HotwordResult> = hotwordController.RecognizerStart({sampleRate: 16000});
        PixijsManager.Instance().eyeBlink();
        PixijsManager.Instance().eyeShowHighlight(false);
    
        t.once('Listening', () => {
            //console.log(`renderer: startHotword: on Listening`);
        });
    
        // t.once('hotword', () => {
        //     //console.log(`renderer: startHotword: on hotword: `, eyeInstance);
            
        // });
    
        t.complete
            .then((result: HotwordResult) => {
                // console.log(`HotWord: result:`, result);
                // process.nextTick(this._startRecognizer);
                RomManager.Instance().onHotword();
                hotwordController.dispose();
                t.dispose();
                if (this.state == HubState.HOTWORD) {
                    Hub.Instance().startRecognizer();
                }
            })
            .catch((error: any) => {
                console.log(error);
                if (this.state == HubState.HOTWORD) {
                    this.state = HubState.OFF
                }
                hotwordController.dispose();
                t.dispose();
            });
    }
/*
    startHotword() {
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
                Hub.Instance().startRecognizer();
            })
            .catch((error: any) => {
                console.log(error);
            });
    }
*/
    startMusic() {
        this._musicController = new WwMusicController();
    }
}
