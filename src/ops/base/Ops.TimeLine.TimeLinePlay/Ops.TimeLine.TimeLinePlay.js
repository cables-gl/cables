const play=op.inTriggerButton("Play");

play.onTriggered=function()
{
    op.patch.timer.play();
};
