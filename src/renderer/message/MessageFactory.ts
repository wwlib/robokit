import Msg_Auth from './Msg_Auth';
import Msg_Chat from './Msg_Chat';
import Message from './Message';

/* From Message
export enum MessageType {
    Auth,
    Chat,
}
*/

export interface RemoteInfo {
	address: string;
	port: number;
	size: number;
}

export default class MessageFactory {
    private static msgClz: any[] = [
        Msg_Auth,
        Msg_Chat,
    ];

    constructor() { }

    static parse(messageBuffer: any, rinfo?: RemoteInfo): Message | undefined {
        // console.log(messageBuffer);
        let type: number = messageBuffer[0];
        try {
            let msgClass: any = MessageFactory.msgClz[type];
            let msg: Message = new msgClass() as Message;
            if (rinfo) {
                msg.host = rinfo.address;
                msg.port = rinfo.port;
            }
            msg.load(messageBuffer);
            return msg;
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }
}
