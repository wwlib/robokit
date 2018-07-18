(function (PIXI, lib) {

    var MovieClip = PIXI.animate.MovieClip;
    var Container = PIXI.Container;
    var Graphics = PIXI.Graphics;
    var shapes = PIXI.animate.ShapesCache;

    lib.eye_pupil = Container.extend(function () {
        Container.call(this);
        var instance1 = new Graphics()
            .drawCommands(shapes.eye[0]);
        this.addChild(instance1);
    });

    lib.eye_white = Container.extend(function () {
        Container.call(this);
        var instance1 = new Graphics()
            .drawCommands(shapes.eye[1]);
        this.addChild(instance1);
    });

    lib.eye_blue = Container.extend(function () {
        Container.call(this);
        var instance1 = new Graphics()
            .drawCommands(shapes.eye[2]);
        this.addChild(instance1);
    });

    lib.eye_1 = Container.extend(function () {
        Container.call(this);
        var instance3 = this.eye_blue = new lib.eye_blue();
        var instance2 = this.eye_white = new lib.eye_white();
        var instance1 = this.eye_pupil = new lib.eye_pupil();
        this.addChild(instance3, instance2, instance1);
    });

    lib.eye = MovieClip.extend(function () {
        MovieClip.call(this, {
            duration: 50,
            framerate: 30,
            labels: {
                idle: 0,
                to_left: 4,
                left: 8,
                from_left: 18,
                to_right: 19,
                right: 23,
                from_right: 33,
                to_blink: 34,
                blink: 37,
                from_blink: 48
            }
        });
        var instance1 = this.eye = new lib.eye_1();
        this.addTimedChild(instance1, 0, 50, {
            "0": {
                x: 640,
                y: 360,
                sy: 1
            },
            "5": {
                x: 527.1
            },
            "6": {
                x: 422.5
            },
            "7": {
                x: 326.3
            },
            "8": {
                x: 238.45
            },
            "9": {
                x: 301.15
            },
            "10": {
                x: 372.25
            },
            "11": {
                x: 435.05
            },
            "12": {
                x: 489.4
            },
            "13": {
                x: 535.45
            },
            "14": {
                x: 573.1
            },
            "15": {
                x: 602.35
            },
            "16": {
                x: 623.3
            },
            "17": {
                x: 635.8
            },
            "18": {
                x: 640
            },
            "20": {
                x: 752.9
            },
            "21": {
                x: 857.5
            },
            "22": {
                x: 953.75
            },
            "23": {
                x: 1041.6
            },
            "24": {
                x: 978.85
            },
            "25": {
                x: 907.75
            },
            "26": {
                x: 845
            },
            "27": {
                x: 790.6
            },
            "28": {
                x: 744.6
            },
            "29": {
                x: 706.9
            },
            "30": {
                x: 677.65
            },
            "31": {
                x: 656.75
            },
            "32": {
                x: 644.2
            },
            "33": {
                x: 640
            },
            "35": {
                y: 359.985,
                sy: 0.686
            },
            "36": {
                y: 360.008,
                sy: 0.395
            },
            "37": {
                y: 360.02,
                sy: 0.127
            },
            "38": {
                y: 360.003
            },
            "39": {
                y: 360.014,
                sy: 0.293
            },
            "40": {
                y: 359.979,
                sy: 0.441
            },
            "41": {
                y: 359.999,
                sy: 0.572
            },
            "42": {
                y: 359.98,
                sy: 0.686
            },
            "43": {
                y: 360.015,
                sy: 0.782
            },
            "44": {
                y: 360.005,
                sy: 0.86
            },
            "45": {
                sy: 0.921
            },
            "46": {
                y: 360.015,
                sy: 0.965
            },
            "47": {
                y: 359.98,
                sy: 0.991
            },
            "48": {
                y: 360,
                sy: 1
            }
        });
    });

    lib.eye.assets = {
        "eye": "images/eye.shapes.json"
    };
})(PIXI, lib = lib || {});
var lib;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stage: lib.eye,
        background: 0x0,
        width: 1280,
        height: 720,
        framerate: 30,
        totalFrames: 50,
        library: lib
    };
}