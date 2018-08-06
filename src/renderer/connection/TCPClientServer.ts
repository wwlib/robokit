import TCPClientSession, { MockWebSocket } from './TCPClientSession';
import Message from '../message/Message';
import Msg_Auth from '../message/Msg_Auth';
import WebSocket = require('ws');
const os = require('os');
const hostname = os.hostname();
const fs = require('fs');
const https = require('https');

export default class TCPClientServer {
	public socketServer: WebSocket.Server;
	public nextClientID: number;

	public clients: Map<TCPClientSession, WebSocket | MockWebSocket> = new Map<TCPClientSession, WebSocket | MockWebSocket>();
	public host: string;
	public port: number;

	constructor(port: number) {
		this.port = port;
		this.start();
	}

	// this.clients.forEach((socket: WebSocket, client: TCPClientSession) => {
	//
	// });

	public restart(): void {
		this.clients.forEach((socket: WebSocket, client: TCPClientSession) => {
			client.dispose();
		});
		this.clients = new Map<TCPClientSession, WebSocket>();
	}

	public start(): void {
		var processRequest = function( req: any, res: any ) {
			res.writeHead(200);
			res.end("OK\n");
		};

		var cfg = {
			ssl: false,
			port: this.port,
			//FIXME: the path should be relative
			ssl_key: "certs/key.pem",
			ssl_cert: "certs/certificate.pem",
		};

		var httpsServer = https.createServer({
			// providing server with  SSL key/cert
			key: fs.readFileSync( cfg.ssl_key ),
			cert: fs.readFileSync( cfg.ssl_cert )
		}, processRequest ).listen( cfg.port, ((err) => {
				let address: any = httpsServer.address();
				this.host = address.address;
				if (this.host === "::") {
					this.host = hostname;
				}
				this.port = address.port;
				console.log(`SocketServer: starting server: host ${this.host}, port ${this.port}`);
				this.socketServer = new WebSocket.Server({
					server: httpsServer,
				});

				this.socketServer.on('connection', (socket: any, req: any) => { //FIXME: WebSocket
					console.log(`SocketServer: on connection ${req.headers.host}`);
					var terms = req.headers.host.split(':');
					socket.host = terms[0];
					socket.port = Number(terms[1]);
					this.onConnection(socket);
				});

				this.socketServer.on('error', (error: any) => {
					console.log(`SocketServer: on error: `, error);
					// this.killServer();
				});
			})
		);
	}

	onConnection(socket: WebSocket | MockWebSocket): TCPClientSession {
		let client: TCPClientSession = new TCPClientSession(this, socket);
		// console.log(`${client.ip} : ${client.port} connected to the server.`);
		this.clients.set(client, socket);
		let authMsg: Msg_Auth = new Msg_Auth({
			command: 'connected'
		});
		client.sendMessage(authMsg);
		return client;
	}

	addClientSession(clientSession: TCPClientSession, socket: WebSocket | MockWebSocket): void {
		this.clients.set(clientSession, socket);
	}

	removeClientSession(clientSession: TCPClientSession): void {
		this.clients.delete(clientSession);
		clientSession.dispose();
	}

	// removeClientSessionWithSocket(socket: WebSocket | MockWebSocket): void {
	// 	this.clients.forEach((testSocket: WebSocket, clientSession: TCPClientSession) => {
	// 		if (socket == testSocket) {
	// 			this.clients.delete(clientSession);
	// 			clientSession.dispose();
	// 		}
	// 	});
	// }

	public broadcastMessage(message: Message): void {
		this.clients.forEach((socket: WebSocket, clientSession: TCPClientSession) => {
			clientSession.sendMessage(message);
		});
	}

	private killServer(): void {
		try {
			this.socketServer.close();
			console.log("Server Stopped");
		} catch (err) {
			console.log("Error while stopping Server:");
			console.log(err);
		}
	}

	public removeTCPClient(client: TCPClientSession): void {
		console.log(`Removing client: ${client.userUUID}`);
		client.dispose();
		this.clients.delete(client);
	}

	public timeoutTCPClient(client: TCPClientSession): void {
		console.log("Timing out client: " + client.ip + ":" + client.port);
		this.clients.delete(client);

	}
}
