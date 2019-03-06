const NAMESPACE_DELIMITER: string = '.';

export enum Level {
    debug = 0,
    info,
    warn,
    error,
    special,
    none,
}

export const levelOrder: Level[] = [
    Level.debug,
    Level.info,
    Level.warn,
    Level.error,
    Level.special,
    Level.none,
];

/**
 * Wraps console.log and provides a mechanism to namespace log calls
 *
 * @class Log
 */
class Log {

    /**
     * The namespace of this logger instance
     *
     * @type {string}
     * @memberof Log
     */
    private namespace: string;
    private _level: Level;

    constructor(namespace: string = '', parent?: Log) {
        this.namespace =
            (parent && parent.namespace)
                ? `${parent.namespace}${NAMESPACE_DELIMITER}${namespace}`
                : namespace;
        this.level = (parent)
                ? parent.level
                : Level.error
    }

    get level(): Level {
        return this._level;
    }

    set level(level: Level) {
        this._level = level;
    }
    
    /**
     * Creates a new Log instance with namespace `this.namespace + '/' +
     * subNamespace`
     *
     * @param {string} subNamespace
     * @returns {Log}
     * @memberof Log
     */
    createChild(subNamespace: string): Log {
        const log = new Log(subNamespace, this);
        return log;
    }

    debug(...args: any[]): void {
        if (this._level <= Level.debug) {
            console.log(`${this.namespace}: `, ...args);
        }    }

    info(...args: any[]): void {
        if (this._level <= Level.info) {
            console.info(`${this.namespace}: `, ...args);
        }    }

    warn(...args: any[]): void {
        if (this._level <= Level.warn) {
            console.warn(`${this.namespace}: `, ...args);
        }    }

    error(...args: any[]): void {
        if (this._level <= Level.error) {
            console.error(`${this.namespace}: `, ...args);
        }
    }

    special(...args: any[]): void {
        if (this._level <= Level.special) {
            console.log(`${this.namespace}: `, ...args);
        }
    }

    log(...args: any[]): void {
        this.debug(...args);
    }
}

export default Log;