op.name="Timer";

var play=op.inFunctionButton("Play");
var pause=op.inFunctionButton("Pause");
var reset=op.inFunctionButton("Reset");

var outTime=op.outValue("Time");

var timer=new CABLES.Timer();

play.onTriggered=function()
{
    timer.play();
    op.patch.addOnAnimFrame(op);
};

pause.onTriggered=function()
{
    timer.pause();
    op.patch.removeOnAnimFrame(op);
};

reset.onTriggered=function()
{
    timer.setTime(0);
};

op.onAnimFrame=function()
{
    timer.update();
    outTime.set(timer.get());
    
};