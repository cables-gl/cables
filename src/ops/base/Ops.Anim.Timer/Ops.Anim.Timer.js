op.name="Timer";

var playPause=op.inValueBool("Play",true);
var reset=op.inFunctionButton("Reset");
var outTime=op.outValue("Time");

var timer=new CABLES.Timer();

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
    timer.setTime(0);
};

op.onAnimFrame=function()
{
    timer.update();
    outTime.set(timer.get());

};
