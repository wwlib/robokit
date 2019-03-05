import {EventEmitter} from 'events';
const WebSocket = require('ws');
const ip = require('ip');
import { cert } from './ClientCertificate';
import { Message, MessagePayload } from './SocketServer';
import AsyncToken from '../AsyncToken';

export default class SocketClient extends EventEmitter {

    public hostname: string;
    public port: number;
    public connectionString: string;
    public webSocket: any;
    public nextMessageId: number;

    constructor(hostname: string = '', port: number = 9696) {
        super();
        this.hostname = hostname || ip.address();
        this.port = port;
        this.connectionString = `wss://${this.hostname}:${this.port}`;
        this.webSocket = undefined;
        this.nextMessageId = 0;
        this.startWebSocket();
    }

    startWebSocket() {
        console.log(`startWebSocket: ${this.connectionString}`);

        if (this.webSocket) {
            try {
                this.webSocket.close();
            } catch (e) {
                console.log(e);
            }
            this.webSocket = null;
        }
        try {

            //connect to the certified web socket
            let cas = [cert];

            this.webSocket = new WebSocket(this.connectionString, {
                ca: cas,
                rejectUnauthorized: false, // if using a real certificate set this to true
                checkServerIdentity: ((servername, certificate) => {
                    var expected_cert_common_name = 'TBD';
                    console.log(`certificate.subject.CN:`, certificate.subject.CN);

                    if (certificate.subject.CN !== expected_cert_common_name) {
                        throw Error("Certificate CN doesn't match expected CN: " + expected_cert_common_name);
                    }

                    return undefined;
                }),
            });

            // this.clockSync = new ClockSync((sync_id, cb) => {
            //     //console.log(`Rom: clockSync: sync_id: `, sync_id);
            //     let message: any = {
            //         type: 'syncRequest',
            //         requestTime: this.clockSync._now()
            //     };
            //     let messageString: string = JSON.stringify(message);
            //     //console.log(`    sending syncRequest: ${messageString}`);
            //     webSocket.send(messageString);
            //     webSocket.once('message', (message) => {
            //         let json: any;
            //         try {
            //             json = JSON.parse(message);
            //         } catch (e) {
            //             console.log('onMessage: JSON.parse: ', e);
            //             json = null;
            //         }
            //         if (json && json.type == 'sync') {
            //             let roundTripTime: number = json.timestamp - json.requestTime;
            //             //console.log(`    received sync message: ${json.timestamp} rt: ${roundTripTime}`);
            //             cb(null, json.timestamp);
            //         }
            //     });
            // });

            this.webSocket.on('error', (e: any) => {
                console.log(`error:`, e);
            });

            this.webSocket.on('open', () => {
                let payload: MessagePayload = {
                    status: `OK`,
                    connectionString: `${this.connectionString}`
                }
                this.sendMessage(payload, 'handshake');
                this.emit('connected');
                // this.clockSync.start();
            });

            this.webSocket.on('message', (message: string, flags: any) => {
                // console.log('received message: ',message);
                let json;
                try {
                    json = JSON.parse(message);
                } catch (e) {
                    console.log('websocket onMessage: JSON.parse: ', e);
                    json = null;
                }
                if (json) {
                    console.log('received json message: ', json);
                    if (json.type == 'command') {
                    }
                }
            });

            this.webSocket.on('close', () => {
                console.log('websocket client closed')
                this.webSocket = undefined;
                this.emit('closed');
            });

        } catch (err) {
            this.webSocket = undefined;
            console.log(err);
        }
    }

    sendMessage(payload: MessagePayload, type: string = 'transaction'): AsyncToken<any> {
        console.log(`sendMessage:`, payload);
        const token: AsyncToken<any> = new AsyncToken<any>();
        let currentTime: number = new Date().getTime();
        let message: Message = {
            client: 'test-client',
            id: this.nextMessageId++,
            type: type,
            payload: payload,
            timestamp: currentTime
        };
        token.complete = new Promise<any>((resolve: any, reject: any) => {
            if (this.webSocket) {
                let messageString: string = JSON.stringify(message);
                this.webSocket.send(messageString);
                resolve();
            } else {
                reject();
            }
        })
        return token;
    }
}