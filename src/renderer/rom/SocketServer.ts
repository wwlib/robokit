import {EventEmitter} from 'events';
import WebSocket = require('ws');
const ip = require('ip');
const fs = require('fs');
const httpServ = require('https');
const findRoot = require('find-root');
const path = require('path');

export type Message = {
    client: string;
    id: number;
    type: string;
    data: any;
    sendTime: number;
    status: string;
}

export default class SocketServer extends EventEmitter {

    public socketServer: WebSocket.Server;
    public host: string;
    public port: number;
    public connections: WebSocket[];
    public onConnectionHandler: any;
    public onMessageHandler: any;
    public namedConnections: Map<string, WebSocket>;

    constructor(port: number = 7160) { // 9696
        super();
        this.port = port;
        this.host = ip.address();
        this.onConnectionHandler = this.onConnection.bind(this);
        this.onMessageHandler = this.onMessage.bind(this);
        this.connections = [];
        this.namedConnections = new Map<string, WebSocket>();

        var processRequest = function( req: any, res: any ) {
            res.writeHead(200);
            res.end("OK\n");
        };

        const root = findRoot(__dirname);
        const sslKeyPath = path.join(root, 'certs/server.key');
        const sslCertPath = path.join(root, 'certs/server.crt');

        var cfg = {
            ssl: true,
            port: this.port,
            ssl_key: sslKeyPath,
            ssl_cert: sslCertPath,
        };

        var app = httpServ.createServer({
            // providing server with  SSL key/cert
            key: fs.readFileSync( cfg.ssl_key ),
            cert: fs.readFileSync( cfg.ssl_cert )
        }, processRequest ).listen( cfg.port );


        console.log(`SocketServer: starting server: host: ${this.host}, port ${this.port}`);
        this.socketServer = new WebSocket.Server({
            server: app,
        });

        this.socketServer.on('connection', (socket: WebSocket) => {
            //console.log(`SocketServer: on connection`, socket);
            this.onConnection(socket);
        });
    }

    onConnection(socket: WebSocket): void {
        console.log(`SocketServer: onConnection`, socket.ip);
        socket.on('close', () => {
            console.log('SocketServer: on close');
            let i: number;
            for (i = 0; i < this.connections.length; i++) {
                if (this.connections[i] === socket) {
                    break;
                }
            }
            this.connections.splice(i, 1);
            socket.removeAllListeners();
            this.onClose(socket);
        });
        this.connections.push(socket);
        socket.on('message', (message: any, flags: any) => {
            //console.log('SocketServer: on message: ', message, flags);
            let json: any;
            try {
                json = JSON.parse(message);
            } catch (e) {
                console.error('SocketServer: onMessage: JSON.parse: ', e);
                json = null;
            }
            if (json) {
                this.onMessageHandler(json, socket);
            }
        });
    }

    onMessage(message: any, socket: WebSocket): void {
        // console.log(`SocketServer: onMessage:`, message);
        if (message.type == 'handshake') {
            console.log(`SocketServer: Received handshake from: ${message.client}`);
            const messagePayload: any = message.payload;
            this.namedConnections.set(messagePayload.client, socket);
            let currentTime: number = new Date().getTime();
            let responseMessage: Message = {
                client: `robokit-${this.host}-${this.port}`,
                id: -1,
                type: 'handshake',
                sendTime: currentTime,
                data: {
                    requestTimestamp: message.timestamp
                },
                status: 'OK'
            }

            if (socket && (socket.readyState === WebSocket.OPEN)) {
                this.sendWsJson(socket, responseMessage);
            } else {
                console.log(`SocketServer: error: handshake response: socket not defined or not open: `); //, socket);
            }
        } else if (message.type == 'syncRequest') {
            let currentTime: number = new Date().getTime();
            let responseMessage: any = {
                type: 'sync',
                timestamp: currentTime,
                payload: {
                    requestTimestamp: message.timestamp
                }
            }

            if (socket && (socket.readyState === WebSocket.OPEN)) {
                this.sendWsJson(socket, responseMessage);
            } else {
                console.log(`SocketServer: error: sync response: socket not defined or not open: `); //, socket);
            }
        } else if (message.type === 'transaction') {
            console.log(`SocketServer: Received transaction from: ${message.command.client} id: ${message.command.id}`);
            // console.log(JSON.stringify(message));
            this.emit('transaction', message);
        }
        this.emit('message', message);
    }

    namedConnectionExists(name: string): boolean {
        let result: boolean = false;
        if (this.namedConnections.get(name)) {
            result = true;
        }
        return result;
    }

    removeNamedConnection(name: string): void {
        this.namedConnections.delete(name);
    }

    sendMessageToNamedConnection(message: any, name: string): boolean {
        let result: boolean = false;
        let socket: WebSocket = this.namedConnections.get(name);
        // console.log('sending message to: ',message,name);
        if (socket && (socket.readyState === WebSocket.OPEN)) {
            this.sendWsJson(socket, message);
            result = true;
        } else {
            console.log(`SocketServer: socket not open. removing named connection ${name}`);
            this.removeNamedConnection(name);
        }
        return result;
    }

    onClose(socket: WebSocket): void {
        return;
    }

    sendWsJson(socket: WebSocket, json: Object | string): void {
        if (typeof json !== 'string') {
            try {
                json = JSON.stringify(json);
            } catch (e) {
                console.error('SocketServer: sendWsJson: JSON.stringify: ', e);
                json = null;
            }
        }
        // console.log(`SocketServer: sendWsJson: json: `, json);
        socket.send(json);
    }

    broadcastMessage(message: any): void {
        console.log(`SocketServer: broadcastMessage:`, message, this.connections);
        // console.trace();
        this.connections.forEach((socket: WebSocket) => {
            if (socket.readyState === WebSocket.OPEN) {
              //socket.send(message);
              this.sendWsJson(socket, message);
            }
        });
    }

    getNetworkTime(): number {
        let currentTime: number = new Date().getTime();
        // if (this.clockSync) {
        //     currentTime = this.clockSync._now();
        // }
        return currentTime;
    }

    dispose(): void {
        this.connections.forEach((socket: WebSocket) => {
            socket.close();
        });
        this.connections = null;

        this.socketServer.close(() => {
            this.socketServer.removeAllListeners();
            this.socketServer = null;
        });
        this.onConnectionHandler = null;
        this.onMessageHandler = null;
    }
}
