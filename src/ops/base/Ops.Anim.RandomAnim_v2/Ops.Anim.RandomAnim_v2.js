const
    exe = op.inTrigger("exe"),
    min = op.inValue("min", 0),
    max = op.inValue("max", 1),
    duration = op.inValue("duration", 0.5),
    pause = op.inValue("pause between", 0),
    next = op.outTrigger("Next"),
    result = op.outNumber("result"),
    looped = op.outTrigger("Looped");

const anim = new CABLES.Anim();
anim.createPort(op, "easing", reinit);

op.setPortGroup("Timing", [duration, pause]);
op.setPortGroup("Value", [min, max]);

op.toWorkPortsNeedToBeLinked(exe);

min.onChange =
    max.onChange =
    pause.onChange =
    duration.onChange = reinitLater;

let needsReinit = true;

function reinitLater()
{
    needsReinit = true;
}

function getRandom()
{
    const minVal = (min.get());
    return Math.random() * (max.get() - minVal) + minVal;
}

function reinit()
{
    init(getRandom());
    needsReinit = false;
}

function init(v)
{
    anim.clear();

    anim.setValue(CABLES.now() / 1000.0, v);
    // if (pause.get() !== 0.0)
    anim.setValue(CABLES.now() / 1000.0 + pause.get(), v);

    anim.setValue(duration.get() + CABLES.now() / 1000.0 + pause.get(), getRandom());
}

exe.onTriggered = updateExe;

function updateExe()
{
    if (needsReinit)reinit();

    const t = CABLES.now() / 1000.0;
    const v = anim.getValue(t);

    if (anim.hasEnded(t))
    {
        anim.clear();
        init(v);
        looped.trigger();
    }
    result.set(v);
    next.trigger();
}
