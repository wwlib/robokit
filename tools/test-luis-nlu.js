const LUISController = require('../dist/renderer/microsoft/LUISController').default;
const config = require('../data/config.json');

console.log(LUISController);
console.log(config);

luisController = new LUISController();

luisController.config = config;

const token = luisController.getIntentAndEntities('what time is it');
token.complete
    .then((intentAndEntities) => {
        console.log(`NLUIntentAndEntities: `, JSON.stringify(intentAndEntities, null, 2));
    })
    .catch((error) => {
        console.log(error);
    });