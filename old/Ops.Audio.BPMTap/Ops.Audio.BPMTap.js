this.name="Ops.Audio.BPMTap";

var exe=this.addInPort(new CABLES.Port(this,"exe",CABLES.OP_PORT_TYPE_FUNCTION));

var tap=this.addInPort(new CABLES.Port(this,"tap",CABLES.OP_PORT_TYPE_FUNCTION,{"display":"button"}));
var nudgeLeft=this.addInPort(new CABLES.Port(this,"nudgeLeft",CABLES.OP_PORT_TYPE_FUNCTION,{"display":"button"}));
var nudgeRight=this.addInPort(new CABLES.Port(this,"nudgeRight",CABLES.OP_PORT_TYPE_FUNCTION,{"display":"button"}));
var sync=this.addInPort(new CABLES.Port(this,"sync",CABLES.OP_PORT_TYPE_FUNCTION,{"display":"button"}));

var beat=this.addOutPort(new CABLES.Port(this,"beat",CABLES.OP_PORT_TYPE_FUNCTION));
var beat1=this.addOutPort(new CABLES.Port(this,"beat1",CABLES.OP_PORT_TYPE_FUNCTION));
var beat2=this.addOutPort(new CABLES.Port(this,"beat2",CABLES.OP_PORT_TYPE_FUNCTION));
var beat3=this.addOutPort(new CABLES.Port(this,"beat3",CABLES.OP_PORT_TYPE_FUNCTION));
var beat4=this.addOutPort(new CABLES.Port(this,"beat4",CABLES.OP_PORT_TYPE_FUNCTION));
var offbeat=this.addOutPort(new CABLES.Port(this,"offbeat",CABLES.OP_PORT_TYPE_FUNCTION));

var bpm=this.addOutPort(new CABLES.Port(this,"bpm",CABLES.OP_PORT_TYPE_VALUE,{display:'editor'}));


var lastTap=0;
var avg = 0;
var taps=[];
var delay=0;

var doFlash=false;
var doOffbeatFlash = false;

var pressTimeout=null;
var flashInterval=null;
var offbeatFlashInterval=null;
var offbeatIntervalDelay=null;
var doResetInterval = false;
var avgBpm = 0;
var NUDGE_VALUE = 0.5; // to add / substract from avg bpm
var beatCounter = 1; // [1, 2, 3, 4]

exe.onTriggered=function()
{
    if(doFlash)
    {
        beat.trigger();
        switch(beatCounter)
        {
            case 1:
                beat1.trigger();
                break;
            case 2:
                beat2.trigger();
                break;
            case 3:
                beat3.trigger();
                break;
            case 4:
                beat4.trigger();
                break;
        }
        beatCounter++;
        if(beatCounter > 4) beatCounter = 1;
    }
    if(doOffbeatFlash)
    {
        offbeat.trigger();
    }
    doFlash=false;
    doOffbeatFlash = false;
}

function tapPressed()
{
    console.log("tab")
    avg=0;
    
    if(Date.now()-lastTap>1000)
    {
        taps.length=0;
        avg=0;
        beatCounter = 2;
    }
    else
    {
        taps.push( Date.now()-lastTap );
        doFlash=true;
    }
    
    lastTap=Date.now();

    if(taps.length>2)
    {
        avg = getAvg();
        avgBpm = Number(60*1000/avg).toFixed(2);
        bpm.set(avgBpm);
        
        clearTimeout(pressTimeout);
        pressTimeout=setTimeout(function()
        {
            beatCounter = 1;
            resetInterval();
        },avg*4);
    }

}

// should be called "on beat"
function resetInterval()
{
    clearInterval(flashInterval);
    clearInterval(pressTimeout);
    clearInterval(offbeatFlashInterval);
    clearInterval(offbeatIntervalDelay);
    
    flashInterval=setInterval(function(){
        doFlash=true;
        if(doResetInterval === true) 
        {
            resetInterval();
        }
    },avg);
    
    // set offbeat interval in half a beat
    offbeatIntervalDelay = setInterval(function(){
        offbeatFlashInterval=setInterval(function(){
            doOffbeatFlash=true;
            clearInterval(offbeatIntervalDelay);
        },avg);
    }, avg/2);
    
    doResetInterval = false;
    
    //setInterval(flashInterval);
    
    clearInterval(pressTimeout);
    
    avgBpm = Number(60*1000/avg).toFixed(2);
    bpm.set(avgBpm);
}

function getAvg()
{
    if(taps.length>2)
    {
        var avg = taps[1];
        for(var i=0;i<taps.length;i++)
        {
            avg=(taps[i]+avg)/2;
        }
        return avg;
    }
    else {
        return 0;
    }
}

function nudgeLeftPressed()
{
    avg += NUDGE_VALUE;
    doResetInterval = true; // reset interval on beat
}

function nudgeRightPressed()
{
    avg -= NUDGE_VALUE;
    doResetInterval = true; // reset interval on beat
}

function syncPressed()
{
    beatCounter = 2;
    resetInterval(); // reset interval instantly
}

tap.onTriggered = tapPressed;
nudgeLeft.onTriggered = nudgeLeftPressed;
nudgeRight.onTriggered = nudgeRightPressed;
sync.onTriggered = syncPressed;