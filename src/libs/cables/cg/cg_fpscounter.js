import { Events } from "cables-shared-client";
import { now } from "cables";

export class FpsCounter extends Events
{
    constructor()
    {
        super();
        this._timeStartFrame = 0;
        this._timeStartSecond = 0;
        this._fpsCounter = 0;
        this._msCounter = 0;
        this._frameCount = 0;
        this.logFps = false;

        this.stats = { "ms": 0, "fps": 0 };
    }

    get frameCount()
    {
        return this._frameCount;
    }

    startFrame()
    {
        this._timeStartFrame = now();
    }

    endFrame()
    {
        this._frameCount++;
        this._fpsCounter++;

        const timeFrame = now() - this._timeStartFrame;
        this._msCounter += timeFrame;

        if (now() - this._timeStartSecond > 1000) this.endSecond();
    }

    endSecond()
    {
        this.stats.fps = this._fpsCounter;
        this.stats.ms = Math.round(this._msCounter / this._fpsCounter * 100) / 100;

        this.emitEvent("performance", this.stats);
        if (this.logFps)console.log(this.stats);

        // reset
        this._fpsCounter = 0;
        this._msCounter = 0;
        this._timeStartSecond = now();
    }
}
