import { EventEmitter } from 'events';

export default class AsyncToken extends EventEmitter {

    public complete: Promise<any>;

    constructor() {
        super();
    }
}
