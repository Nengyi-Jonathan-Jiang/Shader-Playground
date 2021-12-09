"use strict";
class Scene {
    constructor(updateFunc, drawFunc) {
        this.updateFunc = updateFunc;
        this.drawFunc = drawFunc;
    }
    apply(canvas, currTime, elapsedTime) {
        let res = this.updateFunc(currTime, elapsedTime);
        this.drawFunc(canvas);
        return res;
    }
}
var RESIZE_TYPE;
(function (RESIZE_TYPE) {
    RESIZE_TYPE[RESIZE_TYPE["RESIZE_WINDOW"] = 0] = "RESIZE_WINDOW";
    RESIZE_TYPE[RESIZE_TYPE["RESIZE_PARENT"] = 1] = "RESIZE_PARENT";
    RESIZE_TYPE[RESIZE_TYPE["RESIZE_SELF"] = 2] = "RESIZE_SELF";
})(RESIZE_TYPE || (RESIZE_TYPE = {}));
;
class Game {
    constructor(canvas, aspectRatio = -1, resizeType = RESIZE_TYPE.RESIZE_WINDOW) {
		this.onresize = (width=0,height=0)=>0;
        this.running = false;
        this.canvas = canvas;
        this.aspect_ratio = aspectRatio;
        //Resize handling
        const resize = (w, h) => { const W = Math.min(w, h / this.aspect_ratio); canvas.resize(W, W * this.aspect_ratio);};
        function ii(f) { f(); return f; }
        switch (resizeType) {
            case RESIZE_TYPE.RESIZE_SELF:
                canvas.canvas.onresize = ii(() => {
                    canvas.resize();
                    if (this.aspect_ratio != -1)
                        resize(canvas.width, canvas.height);
					this.onresize(canvas.width, canvas.height);
                });
                break;
            case RESIZE_TYPE.RESIZE_PARENT:
                new ResizeObserver(ii(() => {
                    canvas.resizeToParent();
                    if (this.aspect_ratio != -1)
                        resize(canvas.width, canvas.height);
                    this.onresize(canvas.width, canvas.height);
                })).observe(canvas.parent);
                break;
            case RESIZE_TYPE.RESIZE_WINDOW:
                window.onresize = ii(() => {
                    canvas.resizeToWindow();
                    if (this.aspect_ratio != -1)
                        resize(canvas.width, canvas.height);
					this.onresize(canvas.width, canvas.height);
                });
                break;
            default: throw new Error("ERROR: invalid resize type");
        }
        this.scenes = new Map();
        this.initialScene = "";
    }
    addScene(name, s) {
        if (this.scenes.has(name))
            throw new Error("Invalid scene name: duplicate name");
        this.scenes.set(name, s);
    }
    setInitialScene(name) {
        this.initialScene = name;
    }
    start() {
        this.running = true;
        let currScene = this.initialScene || this.scenes.has("Main") ? "Main" : [...this.scenes.keys()][0];
        Canvas.createAnimation((currTime, elapsedTime) => {
            const scene = this.scenes.get(currScene);
            scene && this.running ? currScene = scene.apply(this.canvas, currTime, elapsedTime) || currScene : "QUIT";
			if(currScene == "QUIT") return true;
        }).then(_ => this.running = false);
    }
    stop() {
        this.running = false;
    }
}