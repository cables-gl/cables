const
    exec = op.inTrigger("Render"),
    inEvents = op.inArray("Times"),
    inRecord = op.inBool("Record Events", false),
    inReset = op.inTriggerButton("Reset"),
    inClear = op.inTriggerButton("Clear"),
    inReResize = op.inBool("ReRender on Resize", true),
    next = op.outTrigger("Next"),
    nextPrerendered = op.outTrigger("Prerendered Frame"),
    outProgress = op.outNumber("Progress", 0),
    numEvents = op.outNumber("Num Events");

exec.onTriggered = render;
inEvents.setUiAttribs({ "hidePort": true });

let isPrerendering = true;

let prerenderCount = 0;
let delaystart = false;
let restartTime = 0;
let restartTimeFreeTimer = 0;
let events = [0];

op.patch.cgl.on("resize", () =>
{
    if (inReResize.get())
    {
        if (!isPrerendering && outProgress.get() == 1)
        {
            restartTime = op.patch.timer.getTime();
            restartTimeFreeTimer = op.patch.freeTimer.getTime();

            isPrerendering = true;
            prerenderCount = 0;
        }
    }
});

inEvents.onChange = () =>
{
    numEvents.set(events.length);
    events = inEvents.get() || [0];
};

op.patch.cgl.on("heavyEvent", (e) =>
{
    if (inRecord.get() && !isPrerendering && CABLES.uniqueArray)
    {
        events.push(Math.round(op.patch.timer.getTime() * 60) / 60);
        events = CABLES.uniqueArray(events);
        inEvents.set(events);
    }
});

let curTime = 0;

inReset.onTriggered = () =>
{
    isPrerendering = true;
};

inClear.onTriggered = () =>
{
    events = [0];
    inEvents.set(events);
};

function fakeNow()
{
    return curTime * 1000;
}

function render()
{
    if (inRecord.get())
    {
        isPrerendering = false;
        outProgress.set(1);
        next.trigger();

        return;
    }
    if (isPrerendering)
    {
        // for(let i=0;i<events.length;i++)
        // {
        if (prerenderCount < events.length)
        {
            const oldInternalNow = CABLES.internalNow;
            CABLES.internalNow = fakeNow;

            curTime = events[prerenderCount];
            op.patch._frameNum = prerenderCount + 22;

            // op.log("isPrerendering at ", curTime);

            CABLES.overwriteTime = curTime;
            op.patch.timer.setTime(curTime);
            op.patch.freeTimer.setTime(curTime);

            // op.log("the time",op.patch.timer.getTime());

            CABLES.overwriteTime = undefined;
            CABLES.internalNow = oldInternalNow;

            // op.patch.timer.setTime(0);
            // op.patch.freeTimer.setTime(0);

            // }
        }

        const numExtraFrames = 30;
        if (prerenderCount >= events.length)
        {
            const t = (numExtraFrames - (prerenderCount - events.length)) / numExtraFrames;

            // op.log("empty prerender...", t);
            op.patch.timer.setTime(t);
            op.patch.freeTimer.setTime(t);
        }

        next.trigger();
        next.trigger();
        // next.trigger();
        // next.trigger();
        outProgress.set(Math.min(1, prerenderCount / (events.length + numExtraFrames)));
        // op.log("progress...", outProgress.get());

        nextPrerendered.trigger();

        if (prerenderCount >= events.length + numExtraFrames)
        {
            op.patch.timer.setTime(restartTime);
            op.patch.freeTimer.setTime(restartTimeFreeTimer);

            // setTimeout(() =>
            // {
            //     delaystart = false;
            isPrerendering = false;
            //     op.patch.timer.setTime(0);
            //     op.patch.freeTimer.setTime(0);
            // }, 500);
        }
        else
            prerenderCount++;
    }
    else
    {
        next.trigger();
    }
}
