const
    exec = op.inTrigger("Render"),
    inEvents = op.inArray("Times"),
    inReset = op.inTriggerButton("Reset"),
    inClear = op.inTriggerButton("Clear"),
    next = op.outTrigger("Next"),
    nextPrerendered = op.outTrigger("Prerendered Frame"),
    outProgress = op.outNumber("Progress"),
    numEvents = op.outNumber("Num Events");

exec.onTriggered = render;
inEvents.setUiAttribs({ "hidePort": true });

let isPrerendering = true;
let prerenderCount = 0;

let events = [];

inEvents.onChange = () =>
{
    numEvents.set(events.length);
    events = inEvents.get() || [];
};

op.patch.cgl.on("heavyEvent", (e) =>
{
    console.log("heavyEvent", op.patch.timer.getTime(), e);
    events.push(Math.round(op.patch.timer.getTime() * 60) / 60);
    events = CABLES.uniqueArray(events);
    inEvents.set(events);
});

let curTime = 0;

inReset.onTriggered = () =>
{
    isPrerendering = true;
};

inClear.onTriggered = () =>
{
    events = [];
    inEvents.set(events);
};

function fakeNow()
{
    return curTime * 1000;
}

function render()
{
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

            console.log("isPrerendering at ", curTime);

            CABLES.overwriteTime = curTime;
            op.patch.timer.setTime(curTime);
            op.patch.freeTimer.setTime(curTime);

            // console.log("the time",op.patch.timer.getTime());

            CABLES.overwriteTime = undefined;
            CABLES.internalNow = oldInternalNow;

            // op.patch.timer.setTime(0);
            // op.patch.freeTimer.setTime(0);

            // }
        }

        if (prerenderCount >= events.length)
        {
            isPrerendering = false;
            op.patch.timer.setTime(0);
            op.patch.freeTimer.setTime(0);
        }

        next.trigger();
        next.trigger();
        next.trigger();
        outProgress.set(prerenderCount / (events.length - 1));

        nextPrerendered.trigger();

        prerenderCount++;
    }
    else next.trigger();
}
