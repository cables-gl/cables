import { Events } from "cables-shared-client";

/**
 * @namespace CABLES
 */

export const internalNow = function ()
{
    return window.performance.now();
};

/*
 * current time in milliseconds
 * @memberof CABLES
 * @function now
 * @static
 *
 */
export const now = function ()
{
    return internalNow();
};

/**
 * Measuring time
 */
class Timer extends Events
{
    static EVENT_PLAY_PAUSE = "playPause";
    static EVENT_TIME_CHANGED = "timeChanged";

    #lastTime = 0;
    #timeOffset = 0;
    #currentTime = 0;
    #paused = true;
    #delay = 0;
    #timeStart = 0;
    #ts;

    constructor()
    {
        super();

        this.#timeStart = 0;
        this.overwriteTime = -1;
    }

    #internalNow()
    {
        if (this.#ts) return this.#ts;
        return internalNow();
    }

    #getTime()
    {
        this.#lastTime = (this.#internalNow() - this.#timeStart) / 1000;
        return this.#lastTime + this.#timeOffset;
    }

    /**
     * @param {number} d
     */
    setDelay(d)
    {
        this.#delay = d;
        this.emitEvent(Timer.EVENT_TIME_CHANGED);
    }

    /**
     * @description returns true if timer is playing
     * @return {Boolean} value
     */
    isPlaying()
    {
        return !this.#paused;
    }

    /**
     * @description update timer
     * @param {any} ts
     * @return {Number} time
     */
    update(ts)
    {
        if (ts) this.#ts = ts;
        if (this.#paused) return;
        this.#currentTime = this.#getTime();

        return this.#currentTime;
    }

    /**
     * @return {Number} time in milliseconds
     */
    getMillis()
    {
        return this.get() * 1000;
    }

    /**
     * @return {Number} value time in seconds
     */
    get()
    {
        return this.getTime();
    }

    getTime()
    {
        if (this.overwriteTime >= 0) return this.overwriteTime - this.#delay;
        return this.#currentTime - this.#delay;
    }

    /**
     * toggle between play/pause state
     */
    togglePlay()
    {
        if (this.#paused) this.play();
        else this.pause();
    }

    /**
     * set current time
     * @param {Number} t
     */
    setTime(t)
    {
        if (isNaN(t) || t < 0) t = 0;
        this.#timeStart = this.#internalNow();
        this.#timeOffset = t;
        this.#currentTime = t;
        this.emitEvent((Timer.EVENT_TIME_CHANGED));
    }

    /**
     * @param {number} val
     */
    setOffset(val)
    {
        if (this.#currentTime + val < 0)
        {
            this.#timeStart = this.#internalNow();
            this.#timeOffset = 0;
            this.#currentTime = 0;
        }
        else
        {
            this.#timeOffset += val;
            this.#currentTime = this.#lastTime + this.#timeOffset;
        }
        this.emitEvent(Timer.EVENT_TIME_CHANGED);
    }

    /**
     * (re)starts the timer
     */
    play()
    {
        this.#timeStart = this.#internalNow();
        this.#paused = false;
        this.emitEvent(Timer.EVENT_PLAY_PAUSE);
    }

    /**
     * pauses the timer
     */
    pause()
    {
        this.#timeOffset = this.#currentTime;
        this.#paused = true;
        this.emitEvent(Timer.EVENT_PLAY_PAUSE);
    }

    static now()
    {
        return window.performance.now();
    }
}

export { Timer };
