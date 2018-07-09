import * as SDK from 'microsoft-speech-browser-sdk';
const findRoot = require('find-root');

const root = findRoot(__dirname);
const configFile = root + '/data/config.json';
const config: any = require(configFile);

export default class MicrosoftSpeechController {

    public recognizer: SDK.Recognizer = null;

    constructor() {
        this.Setup();
        this.RecognizerStart();
    }


    RecognizerSetup(recognitionMode: SDK.RecognitionMode, language: string, format: SDK.SpeechResultFormat, subscriptionKey: string) {
        let recognizerConfig = new SDK.RecognizerConfig(
            new SDK.SpeechConfig(
                new SDK.Context(
                    new SDK.OS(navigator.userAgent, "Browser", null),
                    new SDK.Device("SpeechSample", "SpeechSample", "1.0.00000"))),
            recognitionMode, // SDK.RecognitionMode.Interactive  (Options - Interactive/Conversation/Dictation)
            language, // Supported languages are specific to each recognition mode Refer to docs.
            format); // SDK.SpeechResultFormat.Simple (Options - Simple/Detailed)

        // Alternatively use SDK.CognitiveTokenAuthentication(fetchCallback, fetchOnExpiryCallback) for token auth
        let authentication = new SDK.CognitiveSubscriptionKeyAuthentication(subscriptionKey);

        return SDK.CreateRecognizer(recognizerConfig, authentication);
    }

    RecognizerStart() {
        console.log(`MicrosoftSpeechController: RecognizerStart:`);
        this.recognizer.Recognize((event: any) => {
            /*
                Alternative syntax for typescript devs.
                if (event instanceof SDK.RecognitionTriggeredEvent)
            */
            switch (event.Name) {
                case "RecognitionTriggeredEvent" :
                    this.UpdateStatus("Initializing");
                    break;
                case "ListeningStartedEvent" :
                    this.UpdateStatus("Listening");
                    break;
                case "RecognitionStartedEvent" :
                    this.UpdateStatus("Listening_Recognizing");
                    break;
                case "SpeechStartDetectedEvent" :
                    this.UpdateStatus("Listening_DetectedSpeech_Recognizing");
                    console.log(JSON.stringify(event.Result)); // check console for other information in result
                    break;
                case "SpeechHypothesisEvent" :
                    this.UpdateRecognizedHypothesis(event.Result.Text);
                    console.log(JSON.stringify(event.Result)); // check console for other information in result
                    break;
                case "SpeechFragmentEvent" :
                    this.UpdateRecognizedHypothesis(event.Result.Text);
                    console.log(JSON.stringify(event.Result)); // check console for other information in result
                    break;
                case "SpeechEndDetectedEvent" :
                    this.OnSpeechEndDetected();
                    this.UpdateStatus("Processing_Adding_Final_Touches");
                    console.log(JSON.stringify(event.Result)); // check console for other information in result
                    break;
                case "SpeechSimplePhraseEvent" :
                    this.UpdateRecognizedPhrase(JSON.stringify(event.Result, null, 3));
                    break;
                case "SpeechDetailedPhraseEvent" :
                    this.UpdateRecognizedPhrase(JSON.stringify(event.Result, null, 3));
                    break;
                case "RecognitionEndedEvent" :
                    this.OnComplete();
                    this.UpdateStatus("Idle");
                    console.log(JSON.stringify(event)); // Debug information
                    break;
            }
        })
        .On(() => {
            // The request succeeded. Nothing to do here.
        },
        (error: any) => {
            console.log(error);
        });


    }

    RecognizerStop(recognizer: SDK.Recognizer) {
        // recognizer.AudioSource.Detach(audioNodeId) can be also used here. (audioNodeId is part of ListeningStartedEvent)
        this.recognizer.AudioSource.TurnOff();
    }

    Setup() {
        if (this.recognizer != null) {
            this.RecognizerStop(this.recognizer);
        }
        this.recognizer = this.RecognizerSetup(SDK.RecognitionMode.Interactive, 'en-US', SDK.SpeechResultFormat['Simple'],config.Microsoft.BingSTTSubscriptionKey);
        console.log(`MicrosoftSpeechController: Setup:`, this.recognizer);
    }

    UpdateStatus(status: string) {
        // statusDiv.innerHTML = status;
    }

    UpdateRecognizedHypothesis(text: string, append: boolean=true) {
        // if (append)
        //     hypothesisDiv.innerHTML += text + " ";
        // else
        //     hypothesisDiv.innerHTML = text;
        //
        // var length = hypothesisDiv.innerHTML.length;
        // if (length > 403) {
        //     hypothesisDiv.innerHTML = "..." + hypothesisDiv.innerHTML.substr(length-400, length);
        // }
    }

    OnSpeechEndDetected() {
        // stopBtn.disabled = true;
    }

    UpdateRecognizedPhrase(json: string) {
        // hypothesisDiv.innerHTML = "";
        // phraseDiv.innerHTML += json + "\n";
    }

    OnComplete() {
        // startBtn.disabled = false;
        // stopBtn.disabled = true;
    }
}
