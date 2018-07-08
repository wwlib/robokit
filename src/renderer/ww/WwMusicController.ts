const path = require('path');
const findRoot = require('find-root');

import  { AudioInstrument, AudioNote, InstrumentManager, MidiToMediaPlayer } from 'ww-music';

const root = findRoot(__dirname); // path.resolve(__dirname);
const dirname = path.basename(root)

console.log(root);
console.log(dirname);

// const configFile = path.resolve(__dirname, '/data/instrument_config.json');
const configFile = root + '/data/instrument_config.json';
console.log(configFile);
const instrumentConfig = require(configFile);

export default class WwMusicController {

    constructor() {
        // InstrumentManager.instance.testPieAno();
        InstrumentManager.instance.init(root, instrumentConfig);//(root, instrumentConfig);

        // var intervalId = window.setInterval(function(){
        //     console.log('Playing note:');
        //     InstrumentManager.instance.playMidiNoteWithChannel(48, 127, 1);
        // }, 1000);

        const midiToMediaPlayer = new MidiToMediaPlayer(root);
        midiToMediaPlayer.loadMidiFile('twinkle_twinkle.mid');

        setTimeout(function(){
            console.log(`playing midi file:`, midiToMediaPlayer.midiPlayer);
            midiToMediaPlayer.scheduleAllNoteEvents(performance.now())
         }, 3000);

    }
}
