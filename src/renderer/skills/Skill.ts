import NLUController, { NLUIntentAndEntities } from '../NLUController';
import Hub from './Hub';

export default abstract class Skill {

    public id: string;
    public launchIntent: string = '';
    public running: boolean = false;


    constructor(id: string, launchIntent: string) {
        this.id = id;
        this.launchIntent = launchIntent;
    }

    abstract launch(intentAndEntities: NLUIntentAndEntities, utterance: string): void;

    abstract tick(frameTime: number, elapsedTime: number): void;
}
