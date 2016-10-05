window.performance = (window.performance ||
    {
        offset: Date.now(),
        now: function now()
        {
            return Date.now() - this.offset;
        }
    });

// ----------------------------

CABLES.milliSeconds=function() { return window.performance.now(); };

// ----------------------------

CABLES.Timer=function()
{
    this._timeStart=CABLES.milliSeconds();
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
    this._lastTime=(CABLES.milliSeconds()-this._timeStart)/1000;
    return this._lastTime+this._timeOffset;
};

CABLES.Timer.prototype._eventPlayPause=function()
{
    if(this._eventsPaused)return;
    for(var i in this._cbPlayPause) this._cbPlayPause[i]();
};

CABLES.Timer.prototype._eventTimeChange=function()
{
    if(this._eventsPaused)return;
    for(var i in this._cbTimeChange) this._cbTimeChange[i]();
};

CABLES.Timer.prototype.setDelay=function(d)
{
    this._delay=d;
    this._eventTimeChange();
};

CABLES.Timer.prototype.isPlaying=function()
{
    return !this._paused;
};

CABLES.Timer.prototype.update=function()
{
    if(this._paused) return;
    this._currentTime=this._getTime();

    return this._currentTime;
};

CABLES.Timer.prototype.get=CABLES.Timer.prototype.getTime=function()
{
    if(this.overwriteTime>=0)return this.overwriteTime-this._delay;
    return this._currentTime-this._delay;
};

CABLES.Timer.prototype.togglePlay=function()
{
    if(this._paused) this.play();
        else this.pause();
};

CABLES.Timer.prototype.setTime=function(t)
{
    if(t<0)t=0;
    this._timeStart=CABLES.milliSeconds();
    this._timeOffset=t;
    this._currentTime=t;
    this._eventTimeChange();
};

CABLES.Timer.prototype.setOffset=function(val)
{
    if(this._currentTime+val<0)
    {
        this._timeStart=CABLES.milliSeconds();
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

CABLES.Timer.prototype.play=function()
{
    this._timeStart=CABLES.milliSeconds();
    this._paused=false;
    this._eventPlayPause();
};

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

CABLES.Timer.prototype.onPlayPause=function(cb)
{
    if(cb && typeof cb == "function")
        this._cbPlayPause.push(cb);
};

CABLES.Timer.prototype.onTimeChange=function(cb)
{
    if(cb && typeof cb == "function")
        this._cbTimeChange.push(cb);
};
