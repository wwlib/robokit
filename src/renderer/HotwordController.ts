import AsyncToken from './AsyncToken';

export type HotwordResult = {
    hotword: string;
    index?: number;
    buffer?: any;
}
export default abstract class HotwordController {

    abstract RecognizerStart(options?: any): AsyncToken<HotwordResult>;

}