import AsyncToken from './AsyncToken';

export default abstract class STTController {

    abstract RecognizerStart(options?: any): AsyncToken;

}
