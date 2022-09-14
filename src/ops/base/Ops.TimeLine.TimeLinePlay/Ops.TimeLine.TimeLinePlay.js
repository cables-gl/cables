const
    play = op.inTriggerButton("Play"),
    pause = op.inTriggerButton("Pause"),
    next = op.outTrigger("Next");

play.onTriggered = function ()
{
    op.patch.timer.play();
    next.trigger();
};

pause.onTriggered = function ()
{
    op.patch.timer.pause();
    next.trigger();
};
