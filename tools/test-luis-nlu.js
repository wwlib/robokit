// const LUISController = require('../dist/renderer/microsoft/LUISController').default;
const { LUISController } = require('cognitiveserviceslib');
const config = require('../data/config.json');

luisController = new LUISController(config);

let timeLog = {
    timeStart: new Date().getTime(),
}
const token = luisController.getIntentAndEntities('what time is it');
token.complete
    .then((intentAndEntities) => {
        timeLog.complete = new Date().getTime();
        timeLog.cloudLatency = timeLog.complete - timeLog.timeStart;
        console.log(`NLUIntentAndEntities: `, JSON.stringify(intentAndEntities, null, 2));
        console.log(`timeLog:`, JSON.stringify(timeLog, null, 2));
    })
    .catch((error) => {
        console.log(error);
    });