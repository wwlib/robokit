// import Player from './Player';
import TCPClientSession from '../connection/TCPClientSession';

export enum MessageType {
    Auth,
    Chat,
}

export type MessageOptions = {
	id?: string;
	password?: string
    userUUID?: string;
}

export default abstract class Message {

    protected _id: string;
    protected _password: string;
    public userUUID: string;
	public port: number;
	public host: string;
	public serialNumber: number = 1;

	public abstract getBytes(): any;
	public abstract load(buffer: any): void;
	public abstract getType(): number;

    private _tcpClientSession: TCPClientSession;

    constructor( options?: MessageOptions) {
        options = options || {};
        let defaultOptions: MessageOptions =  {
			id: '',
			password: '',
            userUUID: '',
        }
		options = Object.assign(defaultOptions, options);

		this._id = options.id;
		this._password = options.password;
        this.userUUID = options.userUUID;
    }

    get id(): string {
        return this._id;
    }

    set id(id: string) {
        this._id = id;
    }

    get password(): string {
        return this._password;
    }

    set password(password: string) {
        this._password = password;
    }

    public get tcpClientSession(): TCPClientSession {
        return this._tcpClientSession;
    }

    public set tcpClientSession(session: TCPClientSession) {
        this._tcpClientSession = session;
    }
}
