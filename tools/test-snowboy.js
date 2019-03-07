const SnowboyController = require('../dist/renderer/snowboy/SnowboyController').default;

// console.log(SnowboyController);

function startHotword() {
    const hotwordController = new SnowboyController();
    let t = hotwordController.RecognizerStart({sampleRate: 16000});

    t.on('Listening', () => {
        //console.log(`renderer: startHotword: on Listening`);
    });

    t.on('hotword', () => {
        console.log(`renderer: startHotword: on hotword: `);
    });

    t.complete
        .then((result) => {
            console.log(`HotWord: result:`, result);
        })
        .catch((error) => {
            console.log(error);
        });
}

startHotword();
