### robokit

![RoboKit](docs/img/robokit-logo.png)  

![RoboKit](docs/img/RoboKit.png)

An electron app for transforming a device (i.e. Mac, Raspberry Pi, etc.) into a voice-driven robot.

Note: This a work in progress.


[Medium article about robokit](https://medium.com/@andrew.rapo/make-your-own-conversational-ai-social-robot-with-robokit-a-crude-approximation-of-jibo-10847e9a2661)

see also: [https://github.com/wwlib/robocommander](https://github.com/wwlib/robocommander)

[Demo Video - YouTube](https://youtu.be/r_Vzp8tXdkI)

#### Config

- duplicate `data/config-example.json` and rename it `config.json`  
- add your Azure subscription key
- add your LUIS credentials
- (optional) upload `docs/LUIS-knowledge-graph.json` to LUIS to configure a new NLU app

#### Building

```
yarn
yarn rebuild (see below)
yarn build
yarn start
```

#### Dependencies

OSX  
```
brew install sox
```

#### compiling snowboy for electron
snowboy needs to be recompiled for electron using
```
yarn rebuild
```
This is equivalent to `electron-rebuild -f -w snowboy`
See: https://github.com/dolanmiu/MMM-awesome-alexa/issues/91
#### UI

Say
 - Hey Robo, what time is it?
 - Hey Robo, tell me a joke.
 - Hey Robo, who is your favorite robot?

#### Notes

RoboKit uses:
- Snowboy ([https://www.npmjs.com/package/snowboy](https://www.npmjs.com/package/snowboy)) for **hotword** detection.
- Pixi.js ([https://www.npmjs.com/package/pixi.js](https://www.npmjs.com/package/pixi.js)) for screen animation
- Azure ASR (STT), Azure TTS [https://azure.microsoft.com/en-us/services/cognitive-services/](https://azure.microsoft.com/en-us/services/cognitive-services/)
- LUIS NLU [https://www.luis.ai/](https://www.luis.ai/_)

#### License

[MIT](LICENSE.md)
