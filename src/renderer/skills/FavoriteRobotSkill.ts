import Skill from './Skill';
import { NLUIntentAndEntities } from 'cognitiveserviceslib';
import Hub from './Hub';


export type Favorite = {
    id: string;
    name: string;
    prompt: string;
}

export default class FavoriteRobotSkill extends Skill {

    public favoriteMap: Map<string, Favorite> = new Map<string, Favorite>();
    public favoriteIterator: Iterator<Favorite> = this.favoriteMap.values();

    constructor() {
        super('FavoriteRobotSkill', 'launchFavoriteRobot');
        this.initFavorites();
    }

    initFavorites(): void {
        let favoriteData: any = [
            {id: "001", name: "misty", prompt: "My favorite robot is Gee Bo, but I have a growing fondness for Misty!"},
            {id: "002", name: "r2d2", prompt: "My favorite robot is Gee Bo, but I am also a fan of R2D2!"},
            {id: "003", name: "kismet", prompt: "My favorite robot is Gee Bo, but I have a special place in my firmware for Kismet!"},
            {id: "004", name: "c3po", prompt: "My favorite robot is Gee Bo, but C3PO is pretty cool too!"},
            {id: "005", name: "megatron", prompt: "My favorite robot is Gee Bo, but Megatron is impressive!"},
        ];

        favoriteData.forEach((favorite: any) => {
            this.favoriteMap.set(favorite.id, favorite)
        });

        this.favoriteIterator = this.favoriteMap.values();
    }

    launch(intentAndEntities: NLUIntentAndEntities, utterance: string) :void {
        console.log(`FavoriteRobotSkill: launch: `);
        let favorite: Favorite = this.favoriteIterator.next().value;
        if (!favorite) {
            this.favoriteIterator = this.favoriteMap.values();
            favorite = this.favoriteIterator.next().value;
        }
        let favoritePrompt: string = favorite.prompt;
        Hub.Instance().startTTS(favoritePrompt);
    }

    tick(frameTime: number, elapsedTime: number): void {

    }
}
