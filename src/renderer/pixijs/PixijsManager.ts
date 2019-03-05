import {EventEmitter} from "events";
import * as PIXI from 'pixi.js'
import animate = require('pixi-animate');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const eyeClassPath = root + '/assets/eye/eye.js';
const basePath = root + '/assets/eye';
const eyeClass: any = require(eyeClassPath);

export type PixijsManagerOptions = {

}

export default class PixijsManager extends EventEmitter {

    private static _instance: PixijsManager;

    public canvasElement: HTMLCanvasElement;
    public renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    public eyeInstance: any;
    public stage: PIXI.Container;

    private _update: any;
    private _loaderCallback: any;
    private _running: boolean;

    constructor(options?: PixijsManagerOptions) {
        super ();
        this._running = false;
    }

    static Instance(options?: PixijsManagerOptions)
    {
        return this._instance || (this._instance = new this(options));
    }

    init(): void {
        this.canvasElement = document.getElementById("stage") as HTMLCanvasElement;
        this.renderer = PIXI.autoDetectRenderer(1280, 720, {
            view: this.canvasElement,
            backgroundColor: 0x0,
            antialias: true
        });
        
        this.stage = new PIXI.Container();
        this._loaderCallback = (instance: any, loader: any):void => {
            this.eyeInstance = instance;
            this.eyeInstance.gotoAndStop('idle');
            this.eyeInstance.eye.eye_blue.visible = false;
        }
        animate.load(eyeClass.library.eye, this.stage, this._loaderCallback as any, basePath);
    }

    start(): void {
        this._running = true;
       
        this._update = () => {
            if (this.stage) {
                this.renderer.render(this.stage);
            }
            if (this._running) {
                requestAnimationFrame(this._update);
            }
        }
        this._update();
    }

    stop(): void {
        this._running = false;
    }

    //// Eye Control ////

    eyeBlink(): void {
        if (this.eyeInstance) {
            this.eyeInstance.gotoAndPlay('blink');
        }
    }

    eyeIdle(): void {
        if (this.eyeInstance) {
            this.eyeInstance.gotoAndStop('idle');
        }
    }

    eyeLookLeft(): void {
        if (this.eyeInstance) {
            this.eyeInstance.gotoAndPlay('to_left');
        }
    }

    eyeLookRight(): void {
        if (this.eyeInstance) {
            this.eyeInstance.gotoAndPlay('to_right');
        }
    }

    eyeShowHighlight(flag: boolean = true) {
        if (this.eyeInstance) {
            this.eyeInstance.eye.eye_blue.visible = flag;
        }
    }
}
