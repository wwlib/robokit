const { AzureTTSController } = require('cognitiveserviceslib');
const config = require('../data/config.json');

azureTTSController = new AzureTTSController(config);

const token = azureTTSController.SynthesizerStart("The time is 10 32");

let timeLog = {
    timeStart: new Date().getTime(),
    synthesisStreamStarted: 0,
    timeToSynthesisStreamStarted: 0,
    synthesisStreamEnded: 0,
    timeToSynthesisStreamEnded: 0,
}
token.on('Synthesizing', () => {
    console.log(`azureTTSController: on Synthesizing`);
});

token.on('SynthesisStreamStartedEvent', () => {
    console.log(`azureTTSController: on SynthesisStreamStartedEvent`);
    timeLog.synthesisStreamStarted = new Date().getTime();
    timeLog.timeToSynthesisStreamStarted = timeLog.synthesisStreamStarted - timeLog.timeStart;
});

token.on('SynthesisStreamEndedEvent', () => {
    console.log(`azureTTSController: on SynthesisStreamEndedEvent`);
    timeLog.synthesisStreamEnded = new Date().getTime();
    timeLog.timeToSynthesisStreamEnded = timeLog.synthesisStreamEnded - timeLog.timeStart;
});

token.complete
    .then((ttsResponse) => {
        timeLog.complete = new Date().getTime();
        timeLog.cloudLatency = timeLog.complete - timeLog.timeStart;
        console.log(`azureTTSController: result: ${ttsResponse.text}`);
        console.log(`timeLog:`, JSON.stringify(timeLog, null, 2));
    })
    .catch((error) => {
        console.log(error);
    });