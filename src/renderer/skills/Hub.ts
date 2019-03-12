import {EventEmitter} from "events";
import Skill from './Skill';
import HotwordController, { HotwordResult } from '../HotwordController';
import SnowboyController from '../snowboy/SnowboyController';
import STTController from '../STTController';
import BingSpeechApiController from '../microsoft/BingSpeechApiController';
import NLUController, { NLUIntentAndEntities } from '../NLUController';
import LUISController from '../microsoft/LUISController';
import TTSController from '../TTSController';
import BingTTSController from '../microsoft/BingTTSController';
import AsyncToken from '../AsyncToken';
import PixijsManager from '../pixijs/PixijsManager';
import RomManager from '../rom/RomManager';
import WwMusicController from '../ww/WwMusicController';

import ClockSkill from './ClockSkill';
import JokeSkill from './JokeSkill';
import FavoriteRobotSkill from './FavoriteRobotSkill';

export type HubOptions = {

}

export default class Hub extends EventEmitter {

    private static _instance: Hub;

    public skillMap: Map<string, Skill | undefined>;
    public launchIntentMap: Map<string,  Skill | undefined>;
    public luisController = new LUISController();
    public tickInterval: any;
    public startTickTime: number;
    public previousTickTime: number;
    public audioContext: AudioContext;

    constructor(options?: HubOptions) {
        super ();
        console.log(`HUB: CONSTRUCTOR!!`);
        this.skillMap = new Map<string, Skill>();
        this.launchIntentMap = new Map<string, Skill>();
        this.audioContext = new AudioContext();
        this.registerSkill(new JokeSkill());
        this.registerSkill(new ClockSkill());
        this.registerSkill(new FavoriteRobotSkill());
        this.startTickTime = new Date().getTime();
        this.previousTickTime = this.startTickTime;
        // TODO
        // this.tickInterval = setInterval(this.tick.bind(this), 1000);
    }

    static Instance(options?: HubOptions)
    {
        return this._instance || (this._instance = new this(options));
    }

    init(): void {

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
        const ttsController: TTSController = new BingTTSController(this.audioContext);
        let t: AsyncToken<string> = ttsController.SynthesizerStart(prompt);

        t.on('Synthesizing', () => {
            // console.log(`renderer: startRecognizer: on Synthesizing`);
        });

        t.on('SynthesisEndedEvent', () => {
            // console.log(`renderer: startRecognizer: on SynthesisEndedEvent`);
        });

        t.complete
            .then((result: string) => {
                // console.log(`SYNTHESIS RESULT: ${result}`);
            })
            .catch((error: any) => {
                console.log(error);
            });
    }

    startNLU(utterance: string) {
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

    startRecognizer() {
        PixijsManager.Instance().eyeShowHighlight();
        setTimeout(() => {
            this.startHotword();
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
        //             this.startNLU(utterance);
        //         }
        //     })
        //     .catch((error: any) => {
        //         console.log(error);
        //     });
    
    }

    startHotword() {
        console.log(`START HOTWORD`);
        console.trace();
        const hotwordController: HotwordController = new SnowboyController();
        let t: AsyncToken<HotwordResult> = hotwordController.RecognizerStart({sampleRate: 16000});
        PixijsManager.Instance().eyeBlink();
        PixijsManager.Instance().eyeShowHighlight(false);
    
        t.on('Listening', () => {
            //console.log(`renderer: startHotword: on Listening`);
        });
    
        t.on('hotword', () => {
            //console.log(`renderer: startHotword: on hotword: `, eyeInstance);
            RomManager.Instance().onHotword();
        });
    
        t.complete
            .then((result: HotwordResult) => {
                // console.log(`HotWord: result:`, result);
                this.startRecognizer();
            })
            .catch((error: any) => {
                console.log(error);
            });
    }

    startMusic() {
        const musicController = new WwMusicController();
    }
}
