
export const internalNow=function() { return window.performance.now(); };

/**
 * current time in milliseconds
 * @memberof CABLES
 * @function now
 * @static
 */
export const now=function() { return internalNow(); };

// ----------------------------

/**
 * Measuring time 
 * @external CABLES
 * @namespace Timer
 * @hideconstructor
 * @class
 */
const Timer=function()
{
    this._timeStart= internalNow();
    this._timeOffset=0;

    this._currentTime=0;
    this._lastTime=0;
    this._paused=true;
    this._delay=0;
    this._eventsPaused=false;
    this.overwriteTime=-1;

    this.cbPlayPause=[];
    this.cbTimeChange=[];
};

Timer.prototype._getTime=function()
{
    this._lastTime=(internalNow()-this._timeStart)/1000;
    return this._lastTime+this._timeOffset;
};

Timer.prototype._eventPlayPause=function()
{
    if(this._eventsPaused)return;
    for(var i in this.cbPlayPause) this.cbPlayPause[i]();
};

Timer.prototype._eventTimeChange=function()
{
    if(this._eventsPaused)return;
    for(var i in this.cbTimeChange) this.cbTimeChange[i]();
};

Timer.prototype.setDelay=function(d)
{
    this._delay=d;
    this._eventTimeChange();
};

/**
 * @function
 * @memberof Timer
 * @instance
 * @description returns true if timer is playing
 * @return {Boolean} value
 */
Timer.prototype.isPlaying=function()
{
    return !this._paused;
};

/**
 * @function
 * @memberof Timer
 * @instance
 * @description update timer
 * @return {Number} time
 */
Timer.prototype.update=function()
{
    if(this._paused) return;
    this._currentTime=this._getTime();

    return this._currentTime;
};

/**
 * @function
 * @memberof Timer
 * @instance
 * @return {Number} time in milliseconds
 */
Timer.prototype.getMillis=function()
{
    return this.get()*1000;
};

/**
 * @function
 * @memberof Timer
 * @instance
 * @return {Number} value time in seconds
 */
Timer.prototype.get=Timer.prototype.getTime=function()
{
    if(this.overwriteTime>=0)return this.overwriteTime-this._delay;
    return this._currentTime-this._delay;
};

/**
 * toggle between play/pause state
 * @function
 * @memberof Timer
 * @instance
 */
Timer.prototype.togglePlay=function()
{
    if(this._paused) this.play();
        else this.pause();
};

/**
 * set current time
 * @function
 * @memberof Timer
 * @instance
 * @param {Number} time
 */
Timer.prototype.setTime=function(t)
{
    if(t<0)t=0;
    this._timeStart=internalNow();
    this._timeOffset=t;
    this._currentTime=t;
    this._eventTimeChange();
};

Timer.prototype.setOffset=function(val)
{
    if(this._currentTime+val<0)
    {
        this._timeStart=internalNow();
        this._timeOffset=0;
        this._currentTime=0;
    }
    else
    {
        this._timeOffset+=val;
        this._currentTime=this._lastTime+this._timeOffset;
    }
    this._eventTimeChange();
};

/**
 * (re)starts the timer
 * @function
 * @memberof Timer
 * @instance
 */
Timer.prototype.play=function()
{
    this._timeStart=internalNow();
    this._paused=false;
    this._eventPlayPause();
};

/**
 * pauses the timer
 * @function
 * @memberof Timer
 * @instance
 */
Timer.prototype.pause=function()
{
    this._timeOffset=this._currentTime;
    this._paused=true;
    this._eventPlayPause();
};

Timer.prototype.pauseEvents=function(onoff)
{
    this._eventsPaused=onoff;
};

/**
 * @callback
 * @description adds callback, which will be executed it playing state changed
 * @memberof Timer
 * @param {Function} callback
 * @instance
 */
Timer.prototype.onPlayPause=function(cb)
{
    if(cb && typeof cb == "function")
        this.cbPlayPause.push(cb);
};

/**
 * @callback
 * @description adds callback, which will be executed when the current time changes
 * @memberof Timer
 * @param {Function} callback
 * @instance
 */
Timer.prototype.onTimeChange=function(cb)
{
    if(cb && typeof cb == "function")
        this.cbTimeChange.push(cb);
};

export default Timer;
