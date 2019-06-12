const playPause=op.inValueBool("Play",true);
const reset=op.inTriggerButton("Reset");
const outTime=op.outValue("Time");
const inSpeed=op.inValue("Speed",1);

var timer=new CABLES.Timer();
var lastTime=0;
var time=0;

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

reset.onTriggered=function()
{
    time=0;
    lastTime=0;
    timer.setTime(0);
    outTime.set(0);
};

op.onAnimFrame=function()
{
    if(timer.isPlaying())
    {
        timer.update();
        if(lastTime===0)
        {
            lastTime=timer.get();
            return;
        }

        const t=timer.get()-lastTime;
        lastTime=timer.get();
        time+=t*inSpeed.get();
        if(time!=time)time=0;
        outTime.set(time);
    }
};
