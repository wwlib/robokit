import { NLUController, NLUIntentAndEntities, NLURequestOptions, NLULanguageCode } from 'cognitiveserviceslib';
import AsyncToken from '../AsyncToken';

const request = require('request');
const querystring = require('querystring');

const findRoot = require('find-root');
const fs = require('fs');

const root = findRoot(__dirname);
const configFile = root + '/data/config.json';
const configData: any = require(configFile);

export type LUISIntent = {
    intent: string;
    score: number;
};

export type LUISEntity = {
    entity: string;
    type: string;
    startIndex: number;
    endIndex: number;
    resolution: {
        values: string[];
    }
}

export type LUISResponse = {
    query: string;
    topScoringIntent: LUISIntent;
    intents: LUISIntent[];
    entities: LUISEntity[];
}

export default class LUISController extends NLUController {

    public endpoint: string = ''; //config.luis.endpoint;
    public luisAppId: string = ''; //config.luis.appId;
    public subscriptionKey: string = ''; //config.luis.subscriptionKey;

    private _config: any = {};

    /**
     * @constructor
     */
     constructor() {
         super();
         this.config = configData;
     }

     set config(config: any) {
         if (config && config.Microsoft.nluLUIS_endpoint && config.Microsoft.nluLUIS_appId && config.Microsoft.nluLUIS_subscriptionKey) {
             this._config = config;
             this.endpoint = this._config.Microsoft.nluLUIS_endpoint;
             this.luisAppId = this._config.Microsoft.nluLUIS_appId;
             this.subscriptionKey = this._config.Microsoft.nluLUIS_subscriptionKey;
         } else {
             console.log(`LUISController: set config: error: incomplete config:`, config);
         }
     }

    call(query: string): Promise<any> {
        // console.log(`LUISController: ${query}`);
        let endpoint = this.endpoint;
        let luisAppId = this.luisAppId;
        let queryParams = {
            "subscription-key": this.subscriptionKey,
            "timezoneOffset": "0",
            "verbose": true,
            "q": query
        }

        let luisRequest = endpoint + luisAppId + '?' + querystring.stringify(queryParams);

        return new Promise((resolve, reject) => {
            request(luisRequest,
                ((error: string, response: any, body: any) => {
                    if (error) {
                        console.log(`LUISController: call: error:`, response, error);
                        reject(error);
                    } else {
                        console.log(`LUISController: call:`, body, error);
                        let body_obj: any = JSON.parse(body);
                        resolve(body_obj);
                    }
                }));
        });
    }

    getEntitiesWithResponse(response: LUISResponse): any {
        let entitiesObject: any = {
            user: 'Someone',
            userOriginal: 'Someone',
            thing: 'that',
            thingOriginal: 'that'
        };

        response.entities.forEach((entity: LUISEntity) => {
            entitiesObject[`${entity.type}Original`] = entity.entity;
            if (entity.resolution && entity.resolution.values) {
                entitiesObject[`${entity.type}`] = entity.resolution.values[0];
            }
        });

        return entitiesObject;
    }

    getIntentAndEntities(utterance: string, options?: NLURequestOptions): AsyncToken<NLUIntentAndEntities> {
        options = options || {};
        let defaultOptions: NLURequestOptions =  {
            languageCode: NLULanguageCode.en_US,
            contexts: undefined,
            sessionId: undefined
        }
        options = Object.assign(defaultOptions, options);

        let token = new AsyncToken<NLUIntentAndEntities>();
        token.complete = new Promise<NLUIntentAndEntities>((resolve, reject) => {
            this.call(utterance)
                .then((response: LUISResponse) => {
                    let intentAndEntities: NLUIntentAndEntities = {
                        intent: '',
                        entities: undefined
                    }
                    if (response && response.topScoringIntent) {
                        intentAndEntities = {
                            intent: response.topScoringIntent.intent,
                            entities: this.getEntitiesWithResponse(response)
                        }
                    }
                    resolve(intentAndEntities);
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
        return token;
    }
}
