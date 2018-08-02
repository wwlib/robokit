import AsyncToken from './AsyncToken';

export type HotwordResult = {
    hotword: string;
    index?: number;
    byffer?: any;
}
export default abstract class HotwordController {

    abstract RecognizerStart(options?: any): AsyncToken<HotwordResult>;

}
