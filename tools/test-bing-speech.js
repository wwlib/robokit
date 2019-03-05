const BingSpeechApiController = require('../dist/renderer/microsoft/BingSpeechApiController').default;
const config = require('../data/config.json');

console.log(BingSpeechApiController);
console.log(config);

bingSpeechApiController = new BingSpeechApiController();

const token = bingSpeechApiController.RecognizerStart({recordDuration: 3000});

token.on('Listening', () => {
    console.log(`bingSpeechApiController: on Listening`);
});

token.on('RecognitionEndedEvent', () => {
    console.log(`bingSpeechApiController: on RecognitionEndedEvent`);
});

token.on('Recording_Stopped', () => {
    console.log(`bingSpeechApiController: on Recording_Stopped`);
});

token.complete
    .then((utterance) => {
        console.log(`bingSpeechApiController: utterance: ${utterance}`);
    })
    .catch((error) => {
        console.log(error);
    });