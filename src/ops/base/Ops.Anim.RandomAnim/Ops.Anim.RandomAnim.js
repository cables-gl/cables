const exe = op.inTrigger("exe");

const min = op.inValue("min", 0);
const max = op.inValue("max", 1);
const seed = op.inValue("random seed", 0);

const duration = op.inValue("duration", 0.5);
const pause = op.inValue("pause between", 0);
const next = op.outTrigger("Next");
const result = op.outValue("result");
const looped = op.outTrigger("Looped");

const anim = new CABLES.Anim();
anim.createPort(op, "easing", reinit);

op.setPortGroup("Timing", [duration, pause]);
op.setPortGroup("Value", [min, max, seed]);

op.toWorkPortsNeedToBeLinked(exe);

let counter = 0;

min.onChange =
max.onChange =
pause.onChange =
seed.onChange =
duration.onChange = reinitLater;

let needsReinit = true;

function reinitLater()
{
    needsReinit = true;
}

function getRandom()
{
    const minVal = (min.get());
    return Math.seededRandom() * (max.get() - minVal) + minVal;
}

function reinit()
{
    Math.randomSeed = seed.get() + counter * 100;
    init(getRandom());
    needsReinit = false;
}

function init(v)
{
    anim.clear();

    anim.setValue(op.patch.freeTimer.get(), v);
    if (pause.get() !== 0.0) anim.setValue(op.patch.freeTimer.get() + pause.get(), v);

    anim.setValue(duration.get() + op.patch.freeTimer.get() + pause.get(), getRandom());
}

exe.onTriggered = updateExe;

function updateExe()
{
    if (needsReinit)reinit();

    const t = op.patch.freeTimer.get();
    const v = anim.getValue(t);

    if (anim.hasEnded(t))
    {
        counter++;
        anim.clear();
        init(v);
        looped.trigger();
    }
    result.set(v);
    next.trigger();
}
