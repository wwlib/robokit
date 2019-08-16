import Skill from './Skill';
import { NLUIntentAndEntities } from 'cognitiveserviceslib';
import Hub from './Hub';

export default class ClockSkill extends Skill {

    constructor() {
        super('clockSkill', 'launchClock');
    }

    launch(intentAndEntities: NLUIntentAndEntities, utterance: string) :void {
            console.log(`ClockSkill: launch: `);
            let time: Date = new Date();
            let hours: number = time.getHours();
            if (hours > 12) {
                hours -= 12;
            }
            let minutes: number =  time.getMinutes();
            let minutesPrefix: string = (minutes < 10) ? 'oh' : '';
            let timePrompt: string = `The time is ${hours} ${minutesPrefix} ${minutes}`;
            Hub.Instance().startTTS(timePrompt);
    }

    tick(frameTime: number, elapsedTime: number): void {

    }
}
