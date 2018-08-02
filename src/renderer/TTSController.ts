import AsyncToken from './AsyncToken';

export default abstract class TTSController {

    abstract SynthesizerStart(text: string, options?: any): AsyncToken<string>;

}
