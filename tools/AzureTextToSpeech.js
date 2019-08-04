const rp = require('request-promise');
const fs = require('fs');
const config = require('../data/config.json');
const subscriptionKey = config.Microsoft.AzureSpeechSubscriptionKey;
console.log(config);
console.log(subscriptionKey);

// Gets an access token.
function getAccessToken() {
    let options = {
        method: 'POST',
        uri: 'https://azurespeechserviceeast.cognitiveservices.azure.com/sts/v1.0/issuetoken', //'https://api.cognitive.microsoft.com/sts/v1.0/issuetoken', //'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken', // Be sure this base URL matches your region
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey
        }
    }
    return rp(options);
}

function textToSpeech(accessToken, text) {
    // Convert the XML into a string to send in the TTS request.
    let body = '<?xml version="1.0"?><speak version="1.0" xml:lang="en-us"><voice xml:lang="en-us" name="Microsoft Server Speech Text to Speech Voice (en-US, Jessa24kRUS)">' + text + '</voice></speak>';

    let options = {
        method: 'POST',
        baseUrl: 'https://eastus.tts.speech.microsoft.com/', //'https://westus.tts.speech.microsoft.com/', // Be sure this base URL matches your region
        url: 'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            //'User-Agent': 'Demo Code',
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
            'Content-Type': 'application/ssml+xml',
            //'Authorization': `Bearer ${this.token}`,
            //'Content-Type': 'application/ssml+xml',
            'Content-Length': body.length,
            //'X-Microsoft-OutputFormat': this.AUDIO_OUTPUT_FORMAT,
            'X-Search-AppId': '00000000000000000000000000000000',
            'X-Search-ClientID': '00000000000000000000000000000000',
            'User-Agent': 'bingspeech-api-client'
        },
        body: body
    }

    var dataLength = 0;
    var returnData = ''.toString('base64');
    var soundFile = [];

    let request = rp(options)
        .on('data', function(chunk) {
                dataLength += chunk.length;
                soundFile.push(chunk)
            })
            .on('end', function() {
                console.log('Data Length = ', dataLength);

                // Create new base64 string from the full sound file. 
                var buf = new Buffer(dataLength); 
                for (var i=0,len=soundFile.length,pos=0; i<len; i++) { 
                    soundFile[i].copy(buf, pos); 
                    pos += soundFile[i].length; 
                } 

                // context.res = {
                //     body: buf.base64Slice()
                // };
                // context.done();
        });
    return request;

};

// module.exports = async function (context, req) {
async function doIt() {
    console.log('Testing Azure TTS.');
    
    if (!subscriptionKey) {
        console.log(`missing subscription key.`)
        // context.res = {
        //     status: 400,
        //     body: "Error With Service Token"
        // };
        
        // context.done();
        return;
    };

    // textToGenerate = "";
    // if (req.query.message || (req.body && req.body.message)) {
    //     textToGenerate = (req.query.message || req.body.message)
    // }
    // else {
    //     // context.res = {
    //     //     status: 400,
    //     //     body: "Please pass a message in the request string or in the request body"
    //     // };
    //     // context.done();
    //     return;
    // }

    try {
        console.log(`requesting accessToken:`);
        const accessToken = await getAccessToken();
        console.log(`accessToken:`, accessToken);
        const textToGenerate = "Hello world."
        await textToSpeech(accessToken, textToGenerate);
    } catch (err) {
        console.log(`Something went wrong: ${err}`);
    }
};

doIt();