import { EventEmitter } from 'events';

export default class AsyncToken<T> extends EventEmitter {

    public complete: Promise<T>;

    constructor() {
        super();
    }

    dispose(): void {
        this.complete = undefined;
        this.removeAllListeners();
    }
}
