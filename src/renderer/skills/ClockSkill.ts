import Skill from './Skill';
import NLUController, { NLUIntentAndEntities } from '../NLUController';
import Hub from './Hub';

export default class ClockSkill extends Skill {

    constructor() {
        super('clockSkill', 'launchClock');
    }

    launch(intentAndEntities: NLUIntentAndEntities, utterance: string) :void {
            console.log(`ClockSkill: launch: `);
            let time: Date = new Date();
            let hours: number = time.getHours(); //'9';
            if (hours > 12) {
                hours -= 12;
            }
            let minutes: number =  time.getMinutes(); //'35'
            let minutesPrefix: string = (minutes < 10) ? 'oh' : '';
            let timePrompt: string = `<anim name='emoji-clock-hf-01' nonBlocking='true'/>The time is ${hours} ${minutesPrefix} ${minutes}`;
            Hub.Instance().startTTS(timePrompt);
    }

    tick(frameTime: number, elapsedTime: number): void {

    }
}
