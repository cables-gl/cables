import { RenderLoop, Patch } from "cables";
import { Events } from "cables-shared-client";
import { CglContext } from "./cgl_state.js";

export class CglRenderLoop extends RenderLoop
{

    /** @type {Patch} */
    #patch;

    /** @type {CglContext} */
    #cgl;

    #renderOneFrame;
    #animReq;

    frameNum = 0;
    onOneFrameRendered = null;
    _frameNext = 0;
    _frameInterval = 0;
    _lastFrameTime = 0;
    reqAnimTimeStamp = 0;
    _frameWasdelayed = true;
    aborted = false;

    constructor(cgl, patch)
    {
        super();
        this.#cgl = cgl;
        this.#patch = patch;
        this.#patch.renderloop = this;

    }

    /**
     * @param {number} timestamp
     */
    exec(timestamp)
    {
        // if (!this.#renderOneFrame && (this.paused || this.aborted)) return;
        this.emitEvent("reqAnimFrame");
        cancelAnimationFrame(this.#animReq);

        this.#patch.config.fpsLimit = this.#patch.config.fpsLimit || 0;
        if (this.#patch.config.fpsLimit)
        {
            this._frameInterval = 1000 / this.#patch.config.fpsLimit;
        }

        const now = CABLES.now();
        const frameDelta = now - this._frameNext;

        if (this.#patch.isEditorMode())
        {
            if (!this.#renderOneFrame)
            {
                if (now - this._lastFrameTime >= 500 && this._lastFrameTime !== 0 && !this._frameWasdelayed)
                {
                    this._lastFrameTime = 0;
                    setTimeout(this.exec.bind(this), 500);
                    this.emitEvent("renderDelayStart");
                    this._frameWasdelayed = true;
                    return;
                }
            }
        }

        if (this.#renderOneFrame || this.#patch.config.fpsLimit === 0 || frameDelta > this._frameInterval || this._frameWasdelayed)
        {
            this.renderFrame(timestamp);

            if (this._frameInterval) this._frameNext = now - (frameDelta % this._frameInterval);
        }

        if (this._frameWasdelayed)
        {
            this.emitEvent("renderDelayEnd");
            this._frameWasdelayed = false;
        }

        if (this.#renderOneFrame)
        {
            if (this.onOneFrameRendered) this.onOneFrameRendered(); // todo remove everywhere and use propper event...
            this.emitEvent(Patch.EVENT_RENDERED_ONE_FRAME);
            this._renderOneFrame = false;
        }

        if (this.#patch.config.doRequestAnimation)
        {
            this.#animReq = this.#patch.getDocument().defaultView.requestAnimationFrame(this.exec.bind(this));
        }
    }

    /**
     * @param {number} timestamp
     */
    renderFrame(timestamp)
    {
        // if (this.paused) return;
        const time = this.#patch.timer.getTime();
        const startTime = performance.now();
        this.#cgl.frameStartTime = this.#patch.timer.getTime();

        const delta = timestamp - this.reqAnimTimeStamp || timestamp;

        this.#patch.updateAnims(null, delta, timestamp);

        this.#cgl.profileData.profileFrameDelta = delta;
        this.reqAnimTimeStamp = timestamp;
        this.#cgl.profileData.profileOnAnimFrameOps = performance.now() - startTime;

        this.#patch.emitEvent(Patch.EVENT_RENDER_FRAME, time);

        this.frameNum++;
        if (this.frameNum == 1)
        {
            if (this.#patch.config.onFirstFrameRendered) this.#patch.config.onFirstFrameRendered();
        }

    }

    pause()
    {
        cancelAnimationFrame(this.#animReq);
        this.#animReq = null;
        this.paused = true;
    }

    resume()
    {
        cancelAnimationFrame(this.#animReq);
        this.paused = false;
        this.exec(0);

    }
}
