import {EventEmitter} from "events";
import Skill from './Skill';
import TTSController from '../TTSController';
import AsyncToken from '../AsyncToken';
import BingTTSController from '../microsoft/BingTTSController';

import NLUController, { NLUIntentAndEntities } from '../NLUController';
import LUISController from '../microsoft/LUISController';

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
        this.skillMap = new Map<string, Skill>();
        this.launchIntentMap = new Map<string, Skill>();
        this.audioContext = new AudioContext();
        this.registerSkill(new JokeSkill());
        this.registerSkill(new ClockSkill());
        this.registerSkill(new FavoriteRobotSkill());
        this.startTickTime = new Date().getTime();
        this.previousTickTime = this.startTickTime;
        // this.tickInterval = setInterval(this.tick.bind(this), 1000);
    }

    static Instance(options?: HubOptions)
    {
        return this._instance || (this._instance = new this(options));
    }

    // tick(): void {
    //     this.skillMap.forEach((skill: Skill | undefined, key: string) => {
    //         if (skill && skill.running) {
    //             let time: number = new Date().getTime();
    //             let frameTime: number = time - this.previousTickTime;
    //             let elapsedTime: number = time - this.startTickTime;
    //             skill.tick(frameTime, elapsedTime);
    //         }
    //     });
    // }


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
}
