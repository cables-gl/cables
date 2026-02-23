const
    play = op.inTriggerButton("Play"),
    pause = op.inTriggerButton("Pause"),
    toggle = op.inTriggerButton("Toggle"),
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

toggle.onTriggered = function ()
{
    op.patch.timer.togglePlay();
    next.trigger();
};
