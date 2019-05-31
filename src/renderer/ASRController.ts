import AsyncToken from './AsyncToken';

export default abstract class ASRController {

    abstract RecognizerStart(options?: any): AsyncToken<string>;

}
