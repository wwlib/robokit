import Skill from './Skill';
import NLUController, { NLUIntentAndEntities } from '../NLUController';
import Hub from './Hub';


export type Joke = {
    id: string;
    name: string;
    prompt: string;
}

export default class JokeSkill extends Skill {

    public jokeMap: Map<string, Joke> = new Map<string, Joke>();
    public jokeIterator: Iterator<Joke> = this.jokeMap.values();

    constructor() {
        super('JokeSkill', 'launchJoke');
        this.initJokes();
    }

    initJokes(): void {
        let jokeData: any = [
            {id: "001", name: "sleevies", prompt: "Where does the General keep his armies? <anim name='Thinking_01' /> In his slee vees!"},
            {id: "002", name: "chicken", prompt: "Why did the chicken cross the road? <anim name='Thinking_01' /> To get to the other side."},
            {id: "003", name: "elephant", prompt: "You know why you never see elephants hiding up in trees? <anim name='Thinking_01' /> Because they’re really good at it."},
            {id: "004", name: "paint", prompt: "What is red and smells like blue paint? <anim name='Thinking_01' /> Red paint."}
        ];

        jokeData.forEach((joke: any) => {
            this.jokeMap.set(joke.id, joke)
        });

        this.jokeIterator = this.jokeMap.values();
    }

    launch(intentAndEntities: NLUIntentAndEntities, utterance: string) :void {
        console.log(`JokeSkill: launch: `);
        let joke: Joke = this.jokeIterator.next().value;
        if (!joke) {
            this.jokeIterator = this.jokeMap.values();
            joke = this.jokeIterator.next().value;
        }
        let jokePrompt: string = joke.prompt;
        Hub.Instance().startTTS(jokePrompt);
    }

    tick(frameTime: number, elapsedTime: number): void {

    }
}
