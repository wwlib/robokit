const { AzureTTSController } = require('cognitiveserviceslib');
const config = require('../data/config.json');

// console.log(AzureTTSController);
console.log(config);

azureTTSController = new AzureTTSController(config);

// console.log(azureTTSController);
// azureTTSController.client.issueToken()
//     .then((token) => {
//         console.log(`token:`, token);
//     })

const token = azureTTSController.SynthesizerStart("This is a test of bing t t s");

token.on('Synthesizing', () => {
    console.log(`azureTTSController: on Synthesizing`);
});

token.on('SynthesisEndedEvent', () => {
    console.log(`azureTTSController: on SynthesisEndedEvent`);
});

token.complete
    .then((result) => {
        console.log(`azureTTSController: result: ${result}`);
    })
    .catch((error) => {
        console.log(error);
    });