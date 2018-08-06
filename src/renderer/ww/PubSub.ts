import * as PubSubJS from 'pubsub-js';
import { EventEmitter } from 'events';

const redis: any = undefined; //require("redis");
const uuidv4 = require('uuid/v4');
const now = require("performance-now");

export enum PubSubMode {
    Off = 'off',
    PubSubJS = 'PubSubJS',
    Redis = 'redis'
}

export type PubSubOptions = {
    uuid?: string;
    deltaTime?: number;
    mode?: PubSubMode;
    debug?: boolean;
}

export interface PubSubClient {
    subscribe(topic: string): void;
    on (event: string, callback: any): void;
    unsubscribe(): void;
    publish(topic: string, data: any): void;
    quit(): void;
}

export class PubSubJSClient extends EventEmitter {

    private _tokens: string[];
    private _onMessageHandler: any = this.onMessage.bind(this);

    constructor() {
        super();
        this._tokens = [];
    }

    subscribe(topic: string): void {
        let token: string = PubSubJS.subscribe(topic, this._onMessageHandler);
        this._tokens.push(token);
    }

    unsubscribe(): void {
        let l: number = this._tokens.length;
        for (var i:number = 0; i<l; i++) {
            let token: string = this._tokens[i];
            PubSubJS.unsubscribe(token)
        }
        this._tokens = undefined;
        this._onMessageHandler = undefined;
    }

    publish(topic: string, data: any): void {
        PubSubJS.publish(topic, data);
    }

    quit(): void {
        this.removeAllListeners();
    }

    private onMessage(topic: string, data: any): void {
        this.emit('message', topic, data);
        this.emit('message_buffer', topic, data);
    }
}

export default class PubSub {

    private static _instance: PubSub;

    public on: boolean = false;
    public uuid: string;
    public debug: boolean;
    public performanceStats: any;

    private _unsubscribeQueue: string[];
    private _subscriptionsCount: number;
    private _clientCount: number;

    private _tickInterval: any;
    private _tickHandler: any = this.tick.bind(this);
    private _deltaTime: number;
    private _mode: PubSubMode;
    public avgTickTime: number;
    public lastTickTime: number;

    constructor( options?: PubSubOptions) {
        options = options || {};
        let defaultOptions: PubSubOptions =  {
            uuid: uuidv4(),
            deltaTime: 200,
            mode: PubSubMode.PubSubJS,
            debug: false
        }
		options = Object.assign(defaultOptions, options);
		this.uuid = options.uuid;
        this._deltaTime = options.deltaTime;
        this._mode = options.mode;
        this.debug = options.debug;
        this.performanceStats = undefined;
        this._unsubscribeQueue = [];
        this._subscriptionsCount = 0;
        this._clientCount = 0;

        this.init();
        console.log(`PubSub: started in ${PubSubMode[this._mode]} mode.`);
    }

    static Instance(options?: PubSubOptions)
    {
        return this._instance || (this._instance = new this(options));
    }

    private init(): void {
        switch(this._mode) {
            case PubSubMode.Off:
                this.on = false;
                break;
            case PubSubMode.PubSubJS:
                this.on = true;
                break;
            case PubSubMode.Redis:
                this.on = true;
                break;
        }
    }

    tick(): void {
        let startTime: number = now();
        let l: number = this._unsubscribeQueue.length;
        let batch: number = Math.min(100, l);
        for (var i=0; i<batch; i++) {
            let tokenToUnsubscribe: string = this._unsubscribeQueue.shift();
            if (tokenToUnsubscribe) {
                this._subscriptionsCount--;
                PubSubJS.unsubscribe(tokenToUnsubscribe);
            }
        }
        this.lastTickTime = now() - startTime;
        this.updateAverageTickTime(this.lastTickTime);
    }

    start(): void {
        this._tickInterval = setInterval(this._tickHandler, this._deltaTime);
    }

    stop(): void {
        clearInterval(this._tickInterval);
    }

    getPerformanceStats(): any {
        this.performanceStats = { unsubscribeQueueLength: this._unsubscribeQueue.length, subscriptionsCount: this._subscriptionsCount }
        return this.performanceStats
    }

    updateAverageTickTime(tickTime): void {
		this.avgTickTime += (tickTime - this.avgTickTime) * 0.1;
	}

    createClient(): PubSubClient {
        if (this.on) {
            this._clientCount++;
            if (this._mode == PubSubMode.Redis) {
                let client = redis.createClient();
                return client;
            } else if (this._mode == PubSubMode.PubSubJS) {
                return new PubSubJSClient();
            }
        } else {
            return undefined;
        }
    }
/*
    subscribe(topic: string, callback: any): string {
        if (this.on) {
            this._subscriptionsCount++;
            if (this._mode == PubSubMode.Redis) {
                let sub = redis.createClient();
                sub.on(topic, callback);
                return sub;
            } else if (this._mode == PubSubMode.PubSubJS) {
                return PubSubJS.subscribe(topic, callback);
            }
        } else {
            return undefined;
        }
    }

    publish(topic: string, data: any): void {
        if (this.on) {
            if (this._mode == PubSubMode.Redis) {
                let sub = redis.createClient();
                sub.on(topic, callback);
                return sub;
            } else if (this._mode == PubSubMode.PubSubJS) {
                PubSubJS.publish(topic, data);
            }
        }
    }

    unsubscribe(token: string): void {
        if (this.on) {
            this._unsubscribeQueue.push(token);
        }
    }
*/
    get mode(): PubSubMode {
        return this._mode;
    }

    get unsubscribeQueueCount(): number {
        return this._unsubscribeQueue.length;
    }

    get subscriptionsCount(): number {
        return this._subscriptionsCount;
    }

    log(msg: string, obj?: any): void {
        console.log(`PubSub: ${msg}: `, obj);
    }
}

/*
var redis = require("redis");
var sub = redis.createClient(), pub = redis.createClient();
var msg_count = 0;

sub.on("subscribe", function (channel, count) {
    pub.publish("a nice channel", "I am sending a message.");
    pub.publish("a nice channel", "I am sending a second message.");
    pub.publish("a nice channel", "I am sending my last message.");
});

sub.on("message", function (channel, message) {
    console.log("sub channel " + channel + ": " + message);
    msg_count += 1;
    if (msg_count === 3) {
        sub.unsubscribe();
        sub.quit();
        pub.quit();
    }
});

sub.subscribe("a nice channel");
*/
