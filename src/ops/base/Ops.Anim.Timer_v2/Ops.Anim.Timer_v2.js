const
    inSpeed=op.inValue("Speed",1),
    playPause=op.inValueBool("Play",true),
    reset=op.inTriggerButton("Reset"),
    inSyncTimeline=op.inValueBool("Sync to timeline",false),
    outTime=op.outValue("Time");

op.setPortGroup("Controls",[playPause,reset,inSpeed]);

const timer=new CABLES.Timer();
var lastTime=null;
var time=0;
var syncTimeline=false;

playPause.onChange=setState;
setState();

function setState()
{
    if(playPause.get())
    {
        timer.play();
        op.patch.addOnAnimFrame(op);
    }
    else
    {
        timer.pause();
        op.patch.removeOnAnimFrame(op);
    }
}

reset.onTriggered=doReset;

function doReset()
{
    time=0;
    lastTime=null;
    timer.setTime(0);
    outTime.set(0);
};

inSyncTimeline.onChange=function()
{
    syncTimeline=inSyncTimeline.get();
    playPause.setUiAttribs({greyout:syncTimeline});
    reset.setUiAttribs({greyout:syncTimeline});
};

op.onAnimFrame=function(tt)
{
    if(timer.isPlaying())
    {

        if(CABLES.overwriteTime!==undefined)
        {
            // console.log(t);

            outTime.set(CABLES.overwriteTime*inSpeed.get());

        } else

        if(syncTimeline)
        {
            outTime.set(tt*inSpeed.get());
        }
        else
        {
            timer.update();
            var timerVal=timer.get();



            if(lastTime===null)
            {
                lastTime=timerVal;
                return;
            }

            var t=Math.abs(timerVal-lastTime);
            lastTime=timerVal;




            time+=t*inSpeed.get();
            if(time!=time)time=0;
            outTime.set(time);
        }
    }
};


