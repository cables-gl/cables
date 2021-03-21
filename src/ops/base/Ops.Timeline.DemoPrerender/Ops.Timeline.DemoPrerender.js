const
    exec = op.inTrigger("Render"),
    inEvents = op.inArray("Times"),
    inReset = op.inTriggerButton("Reset"),
    inClear = op.inTriggerButton("Clear"),
    next = op.outTrigger("Next"),
<<<<<<< HEAD
=======
    nextPrerendered = op.outTrigger("Prerendered Frame"),
>>>>>>> 90fd3a8d451f6e28b2817473d96c0d64a5f6c27e
    outProgress = op.outNumber("Progress"),
    numEvents = op.outNumber("Num Events");

exec.onTriggered = render;
inEvents.setUiAttribs({ "hidePort": true });
<<<<<<< HEAD

let firstTime = true;
=======

let isPrerendering = true;
let prerenderCount = 0;

>>>>>>> 90fd3a8d451f6e28b2817473d96c0d64a5f6c27e
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
<<<<<<< HEAD
    firstTime = true;
=======
    isPrerendering = true;
>>>>>>> 90fd3a8d451f6e28b2817473d96c0d64a5f6c27e
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
<<<<<<< HEAD
    if (firstTime)
    {
        for (let i = 0; i < events.length; i++)
=======
    if (isPrerendering)
    {
        // for(let i=0;i<events.length;i++)
        // {
        if (prerenderCount < events.length)
>>>>>>> 90fd3a8d451f6e28b2817473d96c0d64a5f6c27e
        {
            const oldInternalNow = CABLES.internalNow;
            CABLES.internalNow = fakeNow;

<<<<<<< HEAD
            curTime = events[i];
            op.patch._frameNum = i + 22;

            console.log("prerendering at ", curTime);
=======
            curTime = events[prerenderCount];
            op.patch._frameNum = prerenderCount + 22;

            console.log("isPrerendering at ", curTime);
>>>>>>> 90fd3a8d451f6e28b2817473d96c0d64a5f6c27e

            CABLES.overwriteTime = curTime;
            op.patch.timer.setTime(curTime);
            op.patch.freeTimer.setTime(curTime);

            // console.log("the time",op.patch.timer.getTime());

<<<<<<< HEAD
            next.trigger();
            next.trigger();
            next.trigger();

=======
>>>>>>> 90fd3a8d451f6e28b2817473d96c0d64a5f6c27e
            CABLES.overwriteTime = undefined;
            CABLES.internalNow = oldInternalNow;

            // op.patch.timer.setTime(0);
            // op.patch.freeTimer.setTime(0);
<<<<<<< HEAD
        }
        firstTime = false;
        op.patch.timer.setTime(0);
        op.patch.freeTimer.setTime(0);
        op.patch._frameNum = 0;
=======

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
>>>>>>> 90fd3a8d451f6e28b2817473d96c0d64a5f6c27e
    }
    else next.trigger();
}
