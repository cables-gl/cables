const
    exec = op.inTrigger("Render"),
    next = op.outTrigger("Next"),
    progress = op.outTrigger("Render Progress"),
    done = op.outTrigger("Done"),
    inMaxTime = op.inInt("Max Time", 1),

    inStep = op.inInt("Step", 30),
    inReset = op.inTriggerButton("Reset"),
    outProgress = op.outNumber("Progress", 0);

exec.onTriggered = render;

let start = true;
let curTime = -1;
let wait = true;

inReset.onTriggered = function ()
{
    if (curTime < 0)
        start = true;
};

function render()
{
    if (!start && curTime < 0)
    {
        if (!wait)
            next.trigger();
        wait = false;
        return;
    }

    const maxTime = inMaxTime.get();
    if (start)
    {
        curTime = maxTime;
        start = false;
        wait = true;
    }

    const oldInternalNow = CABLES.internalNow;
    CABLES.internalNow = function ()
    {
        return curTime * 1000;
    };

    CABLES.overwriteTime = curTime;
    op.patch.timer.setTime(curTime);
    op.patch.freeTimer.setTime(curTime);

    outProgress.set((maxTime - curTime) / maxTime);

    next.trigger();
    next.trigger();
    next.trigger();

    CABLES.overwriteTime = undefined;
    CABLES.internalNow = oldInternalNow;

    progress.trigger();

    if (curTime === 0)
    {
        done.trigger();
        curTime = -1;
    }
    else
    {
        curTime -= inStep.get();
        if (curTime < 0)
            curTime = 0;
    }
}
