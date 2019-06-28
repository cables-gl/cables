
CABLES.internalNow=function() { return window.performance.now(); };

/**
 * current time in milliseconds
 * @memberof CABLES
 * @function
 * @static
 */
CABLES.now=function() { return CABLES.internalNow(); };

// ----------------------------

/**
 * @external CABLES
 * @namespace Timer
 * @class
 */
CABLES.Timer=function()
{
    this._timeStart=CABLES.internalNow();
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

CABLES.Timer.prototype._getTime=function()
{
    this._lastTime=(CABLES.internalNow()-this._timeStart)/1000;
    return this._lastTime+this._timeOffset;
};

CABLES.Timer.prototype._eventPlayPause=function()
{
    if(this._eventsPaused)return;
    for(var i in this.cbPlayPause) this.cbPlayPause[i]();
};

CABLES.Timer.prototype._eventTimeChange=function()
{
    if(this._eventsPaused)return;
    for(var i in this.cbTimeChange) this.cbTimeChange[i]();
};

CABLES.Timer.prototype.setDelay=function(d)
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
CABLES.Timer.prototype.isPlaying=function()
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
CABLES.Timer.prototype.update=function()
{
    if(this._paused) return;
    this._currentTime=this._getTime();

    return this._currentTime;
};

/**
 * @function
 * @memberof Timer
 * @instance
 * @description returns time in milliseconds
 * @return {Number} value
 */
CABLES.Timer.prototype.getMillis=function()
{
    return this.get()*1000;
};

/**
 * @function
 * @memberof Timer
 * @instance
 * @description returns time in seconds
 * @return {Number} value
 */
CABLES.Timer.prototype.get=CABLES.Timer.prototype.getTime=function()
{
    if(this.overwriteTime>=0)return this.overwriteTime-this._delay;
    return this._currentTime-this._delay;
};

/**
 * @function
 * @memberof Timer
 * @instance
 * @description toggle playing state
 */
CABLES.Timer.prototype.togglePlay=function()
{
    if(this._paused) this.play();
        else this.pause();
};

/**
 * @function
 * @memberof Timer
 * @instance
 * @description set current time
 */
CABLES.Timer.prototype.setTime=function(t)
{
    if(t<0)t=0;
    this._timeStart=CABLES.internalNow();
    this._timeOffset=t;
    this._currentTime=t;
    this._eventTimeChange();
};

CABLES.Timer.prototype.setOffset=function(val)
{
    if(this._currentTime+val<0)
    {
        this._timeStart=CABLES.internalNow();
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
 * @function
 * @memberof Timer
 * @instance
 * @description (re)starts the timer
 */
CABLES.Timer.prototype.play=function()
{
    this._timeStart=CABLES.internalNow();
    this._paused=false;
    this._eventPlayPause();
};

/**
 * @function
 * @memberof Timer
 * @instance
 * @description pauses the timer
 */
CABLES.Timer.prototype.pause=function()
{
    this._timeOffset=this._currentTime;
    this._paused=true;
    this._eventPlayPause();
};

CABLES.Timer.prototype.pauseEvents=function(onoff)
{
    this._eventsPaused=onoff;
};

/**
 * @callback
 * @description adds callback, which will be executed it playing state changed
 * @memberof Timer
 * @instance
 */
CABLES.Timer.prototype.onPlayPause=function(cb)
{
    if(cb && typeof cb == "function")
        this.cbPlayPause.push(cb);
};

/**
 * @callback
 * @description adds callback, which will be executed when the current time changes
 * @memberof Timer
 * @instance
 */
CABLES.Timer.prototype.onTimeChange=function(cb)
{
    if(cb && typeof cb == "function")
        this.cbTimeChange.push(cb);
};
