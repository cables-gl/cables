const
    play = op.inTriggerButton("Play"),
    next = op.outTrigger("Next");

play.onTriggered = function ()
{
    op.patch.timer.play();
    next.trigger();
};
