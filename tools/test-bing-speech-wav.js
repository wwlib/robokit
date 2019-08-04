const fs = require('fs');
// const wav = require('node-wav');
const BingSpeechApiController = require('../dist/renderer/microsoft/BingSpeechApiController').default;
const config = require('../data/config.json');

console.log(BingSpeechApiController);
console.log(config);

bingSpeechApiController = new BingSpeechApiController();

// console.log(bingSpeechApiController);
// bingSpeechApiController.client.issueToken()
//     .then((token) => {
//         console.log(`token:`, token);
//     })

let waveBuffer;


// let buffer = fs.readFileSync('kprlisten5-weather-16.wav');
// let result = wav.decode(buffer);
// console.log(result.sampleRate);
// console.log(result.channelData); // array of Float32Arrays

// let wavData = encodeWAV(result.channelData, true, 48000);
// let wavData = wav.encode(result.channelData, { sampleRate: 16000, float: true, bitDepth: 16 });

// fs.writeFileSync('out2.wav', wavData);


// wav.encode(result.channelData, { sampleRate: 16000, float: true, bitDepth: 32 });

fs.readFile('kprlisten5-weather.wav', function (err, waveBuffer) {
    if (err) throw err;
    console.log(waveBuffer);

    const token = bingSpeechApiController.RecognizeWaveBuffer(waveBuffer);

    token.on('Listening', () => {
        console.log(`bingSpeechApiController: on Listening`);
    });

    token.on('RecognitionEndedEvent', () => {
        console.log(`bingSpeechApiController: on RecognitionEndedEvent`);
    });

    token.on('Recording_Stopped', () => {
        console.log(`bingSpeechApiController: on Recording_Stopped`);
    });

    token.complete
        .then((utterance) => {
            console.log(`bingSpeechApiController: utterance: ${utterance}`);
        })
        .catch((error) => {
            console.log(error);
        });
});


function floatTo16BitPCM(output, offset, input) {
    for (var i = 0; i < input.length; i++ , offset += 2) {
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}

function writeString(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

//   function encodeWAV(samples: Float32Array, mono: boolean = false, sampleRate?: number) {
function encodeWAV(samples, mono, sampleRate) {
    sampleRate = sampleRate || 16000;
    var buffer = new ArrayBuffer(44 + samples.length * 2);
    var view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 32 + samples.length * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, mono ? 1 : 2, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 4, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    floatTo16BitPCM(view, 44, samples);

    return view;
}
