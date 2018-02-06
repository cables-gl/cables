var playPause=op.inValueBool("Play",true);
var reset=op.inFunctionButton("Reset");
var outTime=op.outValue("Time");
var inSpeed=op.inValue("Speed",1);

var timer=new CABLES.Timer();
var lastTime=0;
playPause.onChange=setState;
setState();

var time=0;

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
    timer.setTime(0);
};

op.onAnimFrame=function()
{
    timer.update();
    if(lastTime===0)
    {
        lastTime=timer.get();
        return;
    }
    
    var t=timer.get()-lastTime;
    lastTime=timer.get();
    time+=t*inSpeed.get();
    outTime.set(time);

};
