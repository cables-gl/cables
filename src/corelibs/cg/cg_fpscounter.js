import { Events } from "cables-shared-client";
import { now } from "cables";

export class FpsCounter extends Events
{
    #timeStartFrame = 0;
    #timeStartSecond = 0;
    #fpsCounter = 0;
    #msCounter = 0;
    #frameCount = 0;
    logFps = false;

    constructor()
    {
        super();

        this.stats = { "ms": 0, "fps": 0 };
    }

    get frameCount()
    {
        return this.#frameCount;
    }

    startFrame()
    {
        this.#timeStartFrame = now();
    }

    endFrame()
    {
        this.#frameCount++;
        this.#fpsCounter++;

        const timeFrame = now() - this.#timeStartFrame;
        this.#msCounter += timeFrame;

        if (now() - this.#timeStartSecond > 1000) this.endSecond();
    }

    endSecond()
    {
        this.stats.fps = this.#fpsCounter;
        this.stats.ms = Math.round(this.#msCounter / this.#fpsCounter * 100) / 100;

        this.emitEvent("performance", this.stats);
        if (this.logFps)console.log(this.stats);

        // reset
        this.#fpsCounter = 0;
        this.#msCounter = 0;
        this.#timeStartSecond = now();
    }
}
