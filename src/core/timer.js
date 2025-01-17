import { Events } from "cables-shared-client";

/**
 * @namespace CABLES
 */

export const internalNow = function ()
{
    return window.performance.now();
};

/**
 * current time in milliseconds
 * @memberof CABLES
 * @function now
 * @static
 */
export const now = function ()
{
    return internalNow();
};

// ----------------------------

/**
 * Measuring time
 * @namespace external:CABLES#Timer
 * @hideconstructor
 * @class
 */
class Timer extends Events
{
    constructor()
    {
        super();

        /**
         * @private
         */
        this._timeStart = internalNow();
        this._timeOffset = 0;
        this._currentTime = 0;
        this._lastTime = 0;
        this._paused = true;
        this._delay = 0;
        this.overwriteTime = -1;
    }

    _internalNow()
    {
        if (this._ts) return this._ts;
        return internalNow();
    }

    _getTime()
    {
        this._lastTime = (this._internalNow() - this._timeStart) / 1000;
        return this._lastTime + this._timeOffset;
    }

    setDelay(d)
    {
        this._delay = d;
        this.emitEvent("timeChange");
    }

    /**
     * @function
     * @memberof Timer
     * @instance
     * @description returns true if timer is playing
     * @return {Boolean} value
     */
    isPlaying()
    {
        return !this._paused;
    }

    /**
     * @function
     * @memberof Timer
     * @instance
     * @param ts
     * @description update timer
     * @return {Number} time
     */
    update(ts)
    {
        if (ts) this._ts = ts;
        if (this._paused) return;
        this._currentTime = this._getTime();

        return this._currentTime;
    }

    /**
     * @function
     * @memberof Timer
     * @instance
     * @return {Number} time in milliseconds
     */
    getMillis()
    {
        return this.get() * 1000;
    }

    /**
     * @function
     * @memberof Timer
     * @instance
     * @return {Number} value time in seconds
     */
    get()
    {
        return this.getTime();
    }

    getTime()
    {
        if (this.overwriteTime >= 0) return this.overwriteTime - this._delay;
        return this._currentTime - this._delay;
    }

    /**
     * toggle between play/pause state
     * @function
     * @memberof Timer
     * @instance
     */
    togglePlay()
    {
        if (this._paused) this.play();
        else this.pause();
    }

    /**
     * set current time
     * @function
     * @memberof Timer
     * @instance
     * @param {Number} t
     */
    setTime(t)
    {
        if (isNaN(t) || t < 0) t = 0;
        this._timeStart = this._internalNow();
        this._timeOffset = t;
        this._currentTime = t;
        this.emitEvent("timeChange");
    }

    setOffset(val)
    {
        if (this._currentTime + val < 0)
        {
            this._timeStart = this._internalNow();
            this._timeOffset = 0;
            this._currentTime = 0;
        }
        else
        {
            this._timeOffset += val;
            this._currentTime = this._lastTime + this._timeOffset;
        }
        this.emitEvent("timeChange");
    }

    /**
     * (re)starts the timer
     * @function
     * @memberof Timer
     * @instance
     */
    play()
    {
        this._timeStart = this._internalNow();
        this._paused = false;
        this.emitEvent("playPause");
    }

    /**
     * pauses the timer
     * @function
     * @memberof Timer
     * @instance
     */
    pause()
    {
        this._timeOffset = this._currentTime;
        this._paused = true;
        this.emitEvent("playPause");
    }
}

export { Timer };
