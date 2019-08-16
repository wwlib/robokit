const { AzureSpeechApiController } = require('cognitiveserviceslib');
const config = require('../data/config.json');

// console.log(AzureSpeechApiController);
console.log(config);

azureSpeechApiController = new AzureSpeechApiController(config);

const token = azureSpeechApiController.RecognizerStart({recordDuration: 3000});

token.on('Listening', () => {
    console.log(`azureSpeechApiController: on Listening`);
});

token.on('RecognitionEndedEvent', () => {
    console.log(`azureSpeechApiController: on RecognitionEndedEvent`);
});

token.on('Recording_Stopped', () => {
    console.log(`azureSpeechApiController: on Recording_Stopped`);
});

token.complete
    .then((utterance) => {
        console.log(`azureSpeechApiController: utterance: ${utterance}`);
    })
    .catch((error) => {
        console.log(error);
    });