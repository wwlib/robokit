const rp = require('request-promise');
const config = require('../data/config.json');
const subscriptionKey = config.Microsoft.AzureSpeechSubscriptionKey;
console.log(config);
console.log(subscriptionKey);

function getAccessToken() {
    let options = {
        method: 'POST',
        uri: 'https://azurespeechserviceeast.cognitiveservices.azure.com/sts/v1.0/issuetoken', //'https://api.cognitive.microsoft.com/sts/v1.0/issuetoken', //'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken', // Be sure this base URL matches your region
        headers: {
            'Content-type': 'application/x-www-form-urlencoded',
            'Content-Length': '0',
            'Ocp-Apim-Subscription-Key': subscriptionKey,
        }

    }
    return rp(options);
}

function getTTS(token) {
    const fileformat = "audio-16khz-128kbitrate-mono-mp3"
    const lang = "en-US"
    const gender = "Male"
    const voice = "Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)"
    const text = "This is a sample text, that Benjamin will speak."

    headers = {
        "Content-type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": fileformat,
        "User-Agent": "TTSForPython",
        "Authorization": "Bearer " + token,
    }

    const body = `<speak version='1.0' xml:lang='${lang}'><voice xml:lang='${lang}' xml:gender='${gender}' name='${voice}'>${text}</voice></speak>`
    console.log(body);


    let options = {
        method: 'POST',
        uri: 'https://eastus.tts.speech.microsoft.com/cognitiveservices/v1', //'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken', // Be sure this base URL matches your region
        headers: {
            "Content-type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": fileformat,
            "User-Agent": "TTSForPython",
            "Authorization": "Bearer " + token,
        },
        body: body

    }
    let dataLength = 0;
    let request = rp(options)
        .on('data', function (chunk) {
            dataLength += chunk.length;
            console.log(`data`);
        })
        .on('end', function () {
            console.log('Data Length = ', dataLength);
        });
    return request;
}

async function doIt() {
    console.log(`requesting accessToken:`);
    const accessToken = await getAccessToken();
    console.log(`accessToken:`, accessToken);
    try {
        await getTTS(accessToken);
    } catch(error) {
        console.log(error);
    }
    console.log(`done`);
}

doIt();
