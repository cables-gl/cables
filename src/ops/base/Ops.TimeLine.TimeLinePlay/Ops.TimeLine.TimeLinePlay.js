op.name="TimeLinePlay";

var play=op.inFunctionButton("Play");

play.onTriggered=function()
{
    op.patch.timer.play();    
};
