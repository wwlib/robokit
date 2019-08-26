import { EventEmitter } from "events";
import Skill from './Skill';
import {
    AsyncToken,
    NLUIntentAndEntities,
    LUISController,
    TTSController,
    TTSResponse,
    AzureTTSController
} from 'cognitiveserviceslib';
import ClockSkill from './ClockSkill';
import JokeSkill from './JokeSkill';
import FavoriteRobotSkill from './FavoriteRobotSkill';

export type HubOptions = {
    config: any
}

export default class Hub extends EventEmitter {

    private static _instance: Hub;

    public skillMap: Map<string, Skill | undefined>;
    public launchIntentMap: Map<string, Skill | undefined>;
    public luisController: LUISController;
    public tickInterval: any;
    public startTickTime: number;
    public previousTickTime: number;
    public audioContext: AudioContext;

    private _config: any;

    constructor(options?: HubOptions) {
        super();
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
    }

    static Instance(options?: HubOptions) {
        return this._instance || (this._instance = new this(options));
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
            })
            .catch((error: any) => {
                console.log(error);
            });
    }
}
