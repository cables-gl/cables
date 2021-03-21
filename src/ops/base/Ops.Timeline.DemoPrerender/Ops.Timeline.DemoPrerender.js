const
    exec = op.inTrigger("Render"),
    inEvents = op.inArray("Times"),
    inReset = op.inTriggerButton("Reset"),
    inClear = op.inTriggerButton("Clear"),
    next = op.outTrigger("Next"),
    outProgress = op.outNumber("Progress"),
    numEvents = op.outNumber("Num Events");

exec.onTriggered = render;
inEvents.setUiAttribs({ "hidePort": true });

let firstTime = true;
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
    firstTime = true;
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
    if (firstTime)
    {
        for (let i = 0; i < events.length; i++)
        {
            const oldInternalNow = CABLES.internalNow;
            CABLES.internalNow = fakeNow;

            curTime = events[i];
            op.patch._frameNum = i + 22;

            console.log("prerendering at ", curTime);

            CABLES.overwriteTime = curTime;
            op.patch.timer.setTime(curTime);
            op.patch.freeTimer.setTime(curTime);

            // outProgress.set(i/(events.length-1));
            // console.log("the time",op.patch.timer.getTime());

            next.trigger();
            next.trigger();
            next.trigger();

            CABLES.overwriteTime = undefined;
            CABLES.internalNow = oldInternalNow;

            // op.patch.timer.setTime(0);
            // op.patch.freeTimer.setTime(0);
        }
        firstTime = false;
        op.patch.timer.setTime(0);
        op.patch.freeTimer.setTime(0);
        op.patch._frameNum = 0;
    }
    next.trigger();
}
