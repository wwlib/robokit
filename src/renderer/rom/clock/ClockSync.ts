import { median, std, mean } from './stat'
import { SYNC_CALLBACK, INTERVAL, DELAY, REPEAT, NOW } from './defaults'
import Log from '../../utils/Log';
import parentLog from '../log';

/**
 * Let's synchronize our clocks!  ClockSync will continuously keep a client's clock
 *  synchronized with the server's clock.
 *
 * @param sendRequest -
 */
export default class ClockSync {

    public log: Log;
    public sendRequest: any;
    public syncCallback: any;
    public interval: number;
    public delay: number;
    public repeat: number;
    public now: any;

    private _syncing: boolean = false;
    private _sync_id: number = -1;
    private _timeout_id: any = null;
    private _results: any[] = [];
    private _offset: number = 0;
    private _sync_complete: boolean = false;
    private _time_of_sync: any = null;
    private _cancel_request: any = null;

    constructor(sendRequest?: any, syncCallback?: any, interval?: number, delay?: number, repeat?: number, now?: any) {
        this.log = parentLog.createChild('clock-sync');
        // this.log.info(`ClockSync: constructor: `, sendRequest);
        this.sendRequest = sendRequest;
        this.syncCallback = syncCallback || SYNC_CALLBACK;
        this.interval = interval || INTERVAL;
        this.delay = delay || DELAY;
        this.repeat = repeat || REPEAT;
        this.now = now || NOW;

        if (typeof this.sendRequest !== 'function') {
            throw new TypeError(`ClockSync: expected sendRequest to be a function but was ${typeof this.sendRequest}`);
        }
        if (typeof this.syncCallback !== 'function') {
            throw new TypeError(`ClockSync: expected syncCallback to be a function but was ${typeof this.syncCallback}`);
        }
        if (typeof this.interval !== 'number' && this.interval >= 0) {
            throw new TypeError('ClockSync: interval must be a positive number');
        }
        if (typeof this.delay !== 'number' && this.delay <= this.interval) {
            throw new TypeError('ClockSync: delay must be a positive number no greater than interval');
        }
        if (typeof this.repeat !== 'number' && this.repeat >= 1) {
            throw new TypeError('ClockSync: repeat must be a postitive number no smaller than 1');
        }
        if (typeof this.now !== 'function') {
            throw new TypeError('ClockSync: now must be a function');
        }
    }

	/*
	 * there's a whole bunch of nasty side effects
	 */
    _perform_nasty_side_effects(new_result) {
        //this.log.info(`ClockSync: _perform_nasty_side_effects`);
        const results = this._results.slice();
        if (results.length >= this.repeat) {
            results.shift();
        }
        results.push(new_result);
        // calculate the limit for outliers
        const roundtrips = results.map(result => result.roundtrip);
        const roundtrip_limit = median(roundtrips) + std(roundtrips);

        // filter all results which have a roundtrip smaller than the mean+std
        const filtered = results.filter(result => result.roundtrip < roundtrip_limit);
        const offsets = filtered.map(result => result.offset);

        const has_new_offset = offsets.length > 0;

        this._sync_id += 1;

        this._offset = has_new_offset
            ? mean(offsets)
            : this._offset;

        this._sync_complete = results.length >= this.repeat;
        if (has_new_offset) {
            this._time_of_sync = this._now();
        }
        this._results = results;

        return has_new_offset;
    }

    _sync() {
        //this.log.info(`ClockSync: _sync: syncing: ${this._syncing}, sync_complete: ${this._sync_complete}`);
        this._timeout_id = null;
        if (!this._syncing) return;
        if (this._sync_complete) {
            this._results = [];
            this._sync_complete = false;
        }
        let has_new_offset = false;
        try {
            const sync_start_time = this.now();
            //this.log.info(`  calling sendRequest at: ${sync_start_time}`);
            this._cancel_request = this.sendRequest(this._sync_id, (err, server_timestamp) => {
                //this.log.info(`  received server response: ${err}, ${server_timestamp}`);
                this._cancel_request = null;
                if (!this._syncing) return;
                if (err) {
                    this.syncCallback(err);
                }
                if (server_timestamp <= 0) {
                    this.syncCallback(new Error(`ClockSync: the timestamp from the server must be a postiive number (${server_timestamp})`));
                }
                try {
                    const sync_end_time = this.now();
                    const roundtrip = sync_end_time - sync_start_time;
                    const result = {
                        roundtrip: roundtrip,
                        offset: server_timestamp - sync_end_time + roundtrip / 2
                    };
                    has_new_offset = this._perform_nasty_side_effects(result);
                    this._timeout_id = setTimeout(this._sync.bind(this), this._sync_complete ? this.interval : this.delay);
                } catch (err) {
                    this.syncCallback(err);
                }
                if (has_new_offset) {
                    this.syncCallback(null, this._offset, this._sync_complete);
                }
            })
        } catch (err) {
            this.syncCallback(err);
        }
    }

    _now() {
        //this.log.info(`ClockSync: _now: ${this._offset}`);
        return this.now() + this._offset;
    }

    start() {
        // this.log.info(`ClockSync: start`);
        if (this._syncing) {
            throw new Error('ClockSync: cannot call ClockSync.start() on an already synchronizing clock.');
        }
        this._syncing = true;
        if (this._sync_complete) {
            // this.log.info(`    sync complete: ${this._now()}, ${this._offset}`);
            const time_since_last_sync = this._now() - this._time_of_sync;
            // if more time has elapsed since we last synchronized
            //  then lets sync right now
            if (this.interval > time_since_last_sync) {
                this._timeout_id = setTimeout(this._sync.bind(this), 0);
            } else {
                this._timeout_id = setTimeout(this._sync.bind(this), this.interval - time_since_last_sync);
            }
        } else {
            // sync right now
            this._timeout_id = setTimeout(this._sync.bind(this), 0);
        }
    }

    stop() {
        // this.log.info(`ClockSync: stop`);
        if (!this._syncing) {
            throw new Error('ClockSync: cannot call ClockSync.stop() on an clock that is not synchronizing.');
        }
        if (this._cancel_request) {
            this._cancel_request();
        }
        this._syncing = false;
        clearTimeout(this._timeout_id);
    }

    get offset() {
        return this._offset;
    }

    get isSyncing() {
        return this._syncing;
    }
}
