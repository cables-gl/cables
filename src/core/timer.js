
CABLES.Timer=function()
{
    var timeStart=Date.now();
    var timeOffset=0;

    var currentTime=0;
    var lastTime=0;
    var paused=true;
    var delay=0;
    var eventsPaused=false;
    this.overwriteTime=-1;

    function getTime()
    {
        lastTime=(Date.now()-timeStart)/1000;
        return lastTime+timeOffset;
    }

    this.setDelay=function(d)
    {
        delay=d;
        eventTimeChange();
    };

    this.isPlaying=function()
    {
        return !paused;
    };

    this.update=function()
    {
        if(paused) return;
        currentTime=getTime();

        return currentTime;
    };

    this.getTime=function()
    {
        if(this.overwriteTime>=0)return this.overwriteTime-delay;
        return currentTime-delay;
    };

    this.togglePlay=function()
    {
        if(paused) this.play();
            else this.pause();
    };

    this.setTime=function(t)
    {
        if(t<0)t=0;
        timeStart=Date.now();
        timeOffset=t;
        currentTime=t;
        eventTimeChange();
    };

    this.setOffset=function(val)
    {
        if(currentTime+val<0)
        {
            timeStart=Date.now();
            timeOffset=0;
            currentTime=0;
        }
        else
        {
            timeOffset+=val;
            currentTime=lastTime+timeOffset;
        }
        eventTimeChange();
    };

    this.play=function()
    {
        timeStart=Date.now();
        paused=false;
        eventPlayPause();
    };

    this.pause=function()
    {
        timeOffset=currentTime;
        paused=true;
        eventPlayPause();
    };

    // ----------------

    var cbPlayPause=[];
    var cbTimeChange=[];
    function eventPlayPause()
    {
        if(eventsPaused)return;
        for(var i in cbPlayPause) cbPlayPause[i]();
    }

    function eventTimeChange()
    {
        if(eventsPaused)return;
        for(var i in cbTimeChange) cbTimeChange[i]();
    }

    this.pauseEvents=function(onoff)
    {
        eventsPaused=onoff;
    };

    this.onPlayPause=function(cb)
    {
        if(cb && typeof cb == "function")
            cbPlayPause.push(cb);
    };

    this.onTimeChange=function(cb)
    {
        if(cb && typeof cb == "function")
            cbTimeChange.push(cb);
    };

};
