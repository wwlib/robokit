import AsyncToken from './AsyncToken';

export default abstract class HotwordController {

    abstract RecognizerStart(options?: any): AsyncToken;

}
