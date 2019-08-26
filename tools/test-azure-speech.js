const { AzureSpeechApiController } = require('cognitiveserviceslib');
const config = require('../data/config.json');

azureSpeechApiController = new AzureSpeechApiController(config);

const token = azureSpeechApiController.RecognizerStart({ recordDuration: 3000 });

let timeLog = {
    timeStart: new Date().getTime(),
    recordingStopped: 0,
    timeToRecordingStopped: 0,
    complete: 0,
    timeToComplete: 0,
}
token.on('Listening', () => {
    console.log(`azureSpeechApiController: on Listening`);
});

token.on('RecognitionEndedEvent', () => {
    console.log(`azureSpeechApiController: on RecognitionEndedEvent`);
    timeLog.recognitionEnded = new Date().getTime();
    timeLog.timeToRecognitionEnded = timeLog.recognitionEnded - timeLog.timeStart;
});

token.on('Recording_Stopped', () => {
    timeLog.recordingStopped = new Date().getTime();
    timeLog.timeToRecordingStopped = timeLog.recordingStopped - timeLog.timeStart;
    console.log(`azureSpeechApiController: on Recording_Stopped`);
});

token.complete
    .then((asrResponse) => {
        timeLog.complete = new Date().getTime();
        timeLog.timeToComplete = timeLog.complete - timeLog.timeStart;
        if (timeLog.timeToRecordingStopped > 0) {
            timeLog.cloudLatency = timeLog.complete - timeLog.recordingStopped;
        } else {
            timeLog.cloudLatency = timeLog.complete - timeLog.recognitionEnded;
        }
        console.log(`azureSpeechApiController: utterance: ${asrResponse.utterance}`);
        console.log(`azureSpeechApiController: response: ${JSON.stringify(asrResponse.response, null, 2)}`);
        console.log(`timeLog:`, JSON.stringify(timeLog, null, 2));
    })
    .catch((error) => {
        console.log(error);
    });