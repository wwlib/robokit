
import { BingSpeechClient, VoiceRecognitionResponse } from 'bingspeech-api-client';
import STTController from '../STTController';
import AsyncToken from '../AsyncToken';
const findRoot = require('find-root');
const fs = require('fs');
//const record = require('node-record-lpcm16');
const { spawn, exec } = require('child_process');

const root = findRoot(__dirname);
const configFile = root + '/data/config.json';
const config: any = require(configFile);

export default class BingSpeechApiController extends STTController{

    constructor() {
        super();
    }

    RecognizerStart(options: any): AsyncToken {
        let recordDuration = 6000;
        if (options && options.recordDuration) {
            recordDuration = options.recordDuration;
        }
        console.log(`BingSpeechApiController: RecognizerStart:`);
        let token = new AsyncToken();
        token.complete = new Promise<string>((resolve: any, reject: any) => {
            process.nextTick(() => {token.emit('Listening');});
            let client = new BingSpeechClient(config.Microsoft.BingSTTSubscriptionKey);

/*
            const ls = exec('sox -b 16 --endian little -c 1 -r 16000 -e signed-integer -t waveaudio default temp.wav trim 0 6');

            ls.stdout.on('data', (data: any) => {
              console.log(`stdout: ${data}`);
            });

            ls.stderr.on('data', (data: any) => {
              console.log(`stderr: ${data}`);
            });

            ls.on('close', (code: any) => {
              console.log(`child process exited with code ${code}`);
              let input =  fs.createReadStream(root + '/temp.wav', { encoding: 'binary' });
              // let outFile = fs.createWriteStream(root + '/out.wav', { encoding: 'binary' });

              let data = '';
              input.on('data', function(chunk: any) {
                console.log('chunk is buffer: ', Buffer.isBuffer(chunk));
                // buffers.push(chunk);
                data += chunk;
              });
              input.on('end', function() {
                    console.log('end');
                    var buffer =  Buffer.from(data, 'binary');
                    client.recognize(buffer).then((response: any) => {
                        console.log(response);
                        token.emit('RecognitionEndedEvent');
                        let result = '';
                        if (response && response.results && response.results[0] && response.results[0].name) {
                            result = response.results[0].name;
                        }
                        resolve(result);
                    });
                });
            });
*/

          let cp: any;
          let record: any = {
              start: function(options?: any) {
                  let cmdOptions = { encoding: 'binary' };
                //   let cmdArgs = [
                //     // '-q',                     // show no progress
                //     '-L',
                //     '-r', 16000, // sample rate
                //     '-c', '1',                // channels
                //     '-e', 'signed-integer',   // sample encoding
                //     '-b', '16',               // precision (bits)
                //     // '-t', 'wavaudio',              // audio type
                //     // '-d',
                //     '-t waveaudio default temp.wav',                      // pipe
                //         // end on silence
                //     // 'silence', '1', '0.1', options.thresholdStart || options.threshold + '%',
                //     // '1', options.silence, options.thresholdEnd || options.threshold + '%'
                // ];
                // var cmdArgs = [
                //       '-q',                                     // show no progress
                //       '-L',
                //       '-t', 'waveaudio',                        // input-type
                //       '-d',                                     // use default recording device
                //       '-r', '16000',      // sample rate
                //       '-c', '1',                                // channels
                //       '-e', 'signed-integer',                   // sample encoding
                //       '-b', '16',                               // precision (bits)
                //       '-t', 'wav',                              // output-type
                //       '-'                                       // pipe
                //     ];
                //cmdArgs = ['−r', '16000', '-c', '1', '−n', '-t', 'sox', '-p', 'synth', '3', 'sine', '300−3300'];
                //sox -b 16 --endian little -c 1 -r 16000 -e signed-integer -t waveaudio default temp.wav trim 0 3
                let cmdArgs = ['-b', '16', '-L', '−r', '16000', '-c', '1', '−e', 'signed-integer', '-t', 'waveaudio', 'default', '-t', 'wav', '-'];
                //cmdArgs = ['-b 16 --endian little -c 1 -r 16000 -e signed-integer -t waveaudio default temp.wav trim 0 3'];
                console.log(`spawn: sox: `, cmdArgs, cmdOptions);
                cp = spawn('sox', cmdArgs, cmdOptions);
                //cp = exec('sox -b 16 --endian little -c 1 -r 16000 -e signed-integer -t waveaudio default -t wav - trim 0 4');
                 return  cp.stdout;
              },
              stop: function() {
                  console.log(`STOP`);
                  if (!cp) {
                    console.log('Please start a recording first')
                    return false
                  }

                  cp.kill() // Exit the spawned process, exit gracefully
                  return cp
              }
          }



            let input = record
                .start()
                // .on('error', (error: any) => {
                //     console.log(error);
                //     reject(error);
                // })
                // .on('data', function (data: any) {
                //   console.log('Recording %d bytes', data.length)
                // })
                //
                // .on('end', function () {
                //   console.log('End Recording')
                // })
            //     .pipe(file);

            setTimeout(() => {
                console.log(`stopping`);
                record.stop();
                token.emit('Recording_Stopped');
                // resolve('ok');
            }, recordDuration);

            // let input =  fs.createReadStream(root + '/temp.wav', { encoding: 'binary' });
            // let outFile = fs.createWriteStream(root + '/out.wav', { encoding: 'binary' });

            // let data = '';
            let buffers: any[] = [];
            input.on('data', function(chunk: any) {
              console.log('chunk is buffer: ', Buffer.isBuffer(chunk));
              buffers.push(chunk);
              // data += chunk;
            });
            input.on('end', function() {
                console.log('end');
              var buffer = Buffer.concat(buffers);
              client.recognize(buffer).then((response: any) => {
                  console.log(response);
                  token.emit('RecognitionEndedEvent');
                  let result = '';
                  if (response && response.results && response.results[0] && response.results[0].name) {
                      result = response.results[0].name;
                  }
                  resolve(result);
              });

              // fs.writeFile('buffer.wav', buffer, function(err: any) {
              //   // handle error, return response, etc...
              //   if (err) {
              //       console.log(err);
              //       reject(err);
              //   } else {
              //       resolve('aok');
              //   }
              // });
            });


        });
        return token;
    }
}

/*
RecognizerStart(options: any): AsyncToken {
    let recordDuration = 6000;
    if (options && options.recordDuration) {
        recordDuration = options.recordDuration;
    }
    console.log(`BingSpeechApiController: RecognizerStart:`);
    let token = new AsyncToken();
    token.complete = new Promise<string>((resolve: any, reject: any) => {
        process.nextTick(() => {token.emit('Listening');});
        let client = new BingSpeechClient(config.Microsoft.BingSTTSubscriptionKey);
        // let file = fs.createWriteStream(root + '/recording.wav', { encoding: 'binary' });
        let input =  fs.createReadStream(root + '/recording.wav', { encoding: 'binary' });
        // let liveStream = record
        //     .start({
        //         sampleRate: 16000,
        //         //thresholdStart: '0.5',
        //         //thresholdEnd: '10.0',
        //         verbose: true,
        //         recordProgram: 'sox'
        //     })
        //     // .on('error', (error: any) => {
        //     //     console.log(error);
        //     //     reject(error);
        //     // })
        //     .pipe(file);

        // setTimeout(() => {
        //     console.log(`stopping`);
        //     record.stop();
        //     token.emit('Recording_Stopped');
        //     // resolve('ok');
        // }, recordDuration);

        client.recognizeStream(input).then((response: any) => {
            // console.log(response.results[0].name);
            token.emit('RecognitionEndedEvent');
            let result = '';
            if (response && response.results && response.results[0] && response.results[0].name) {
                result = response.results[0].name;
            }
            resolve(result);
        });
    });
    return token;
}
*/
