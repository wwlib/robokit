const BingTTSController = require('../dist/renderer/microsoft/BingTTSController').default;
const config = require('../data/config.json');

console.log(BingTTSController);
console.log(config);

bingTTSController = new BingTTSController();

const token = bingTTSController.SynthesizerStart("This is a test of bing t t s");

token.on('Synthesizing', () => {
    console.log(`bingTTSController: on Synthesizing`);
});

token.on('SynthesisEndedEvent', () => {
    console.log(`bingTTSController: on SynthesisEndedEvent`);
});

token.complete
    .then((result) => {
        console.log(`bingTTSController: result: ${result}`);
    })
    .catch((error) => {
        console.log(error);
    });