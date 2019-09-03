const
    play = op.inTriggerButton("Play"),
    pause = op.inTriggerButton("Pause"),
    rewind = op.inTriggerButton("rewind"),
    setTime = op.inFloat("Set current time",0),

    outPlayTrigger = op.outTrigger("play trigger"),
    outPauseTrigger= op.outTrigger("pause trigger"),
    outrewindTrigger = op.outTrigger("rewind trigger"),
    isPlaying = op.outBool("is Playing"),
    outSetTimeTrigger = op.outNumber("set time (seconds)"),
    currentTime = op.outValue("current time"),
    currentFrame = op.outValue("current frame");

play.onTriggered=function()
{
    op.patch.timer.play();

    op.patch.timer.setTime(setTime.get());
    outSetTimeTrigger.set(setTime.get());
    outPlayTrigger.trigger();
};

pause.onTriggered=function()
{
    op.patch.timer.pause();
    outPauseTrigger.trigger();
};


op.onAnimFrame=function(time)
{
    currentFrame.set(Math.round(time*30.0));
    currentTime.set(time);
    isPlaying.set(op.patch.timer.isPlaying());
};

rewind.onTriggered=function()
{
    op.patch.timer.setTime(0);
    outrewindTrigger.trigger();
};


