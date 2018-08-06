import Message, { MessageType } from './Message';

const sp = require('schemapack');

const messageSchema = sp.build({
    __type: "uint8",
    id: "string",
    password: "string",
    userUUID: "string",
    command: "string",
    authToken: "string",
});

export type AuthMessageOptions = {
    id?: string;
	password?: string
    userUUID?: string;
    command?: string;
    authToken?: string;
}

export default class Msg_Auth extends Message {

	public command: string;
    public authToken: string;

    constructor(options?: AuthMessageOptions) {
        super();
        options = options || {};
        let defaultOptions: AuthMessageOptions =  {
            id: '',
			password: '',
            userUUID: '',
            command: '',
            authToken: '',
        }
        options = Object.assign(defaultOptions, options);

        this._id = options.id;
        this._password = options.password;
        this.userUUID = options.userUUID;
        this.command = options.command;
        this.authToken = options.authToken;
	}

	public getBytes(): any {
		var message = {
			__type: this.getType(),
			id: this._id,
            password: this._password,
            userUUID: this.userUUID,
            command: this.command,
            authToken: this.authToken
		};
		return messageSchema.encode(message);
	}

	public load(buffer: any): void { // throws PacketDataNotApplicableException {
		var payload = messageSchema.decode(buffer);
		if (payload) {
			if (payload.__type == this.getType()) {
				this._id = payload.id;
				this._password = payload.password;
                this.userUUID = payload.userUUID;
                this.command = payload.command,
    			this.authToken = payload.authToken
			} else {
				console.log(`Expecting MessageType: ${this.getType()} but got: ${payload.__type}`)
			}
		} else {
			console.log(`Unable to decode message buffer.`);
		}
	}

	public getType(): number {
		return MessageType.Auth;
	}
}
