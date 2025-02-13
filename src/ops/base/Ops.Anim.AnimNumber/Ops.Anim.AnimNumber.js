const
    exe = op.inTrigger("exe"),
    inValue = op.inValue("Value"),
    duration = op.inValueFloat("duration"),
    next = op.outTrigger("Next"),
    result = op.outNumber("result"),
    finished = op.outTrigger("Finished");

let lastTime = 0;
let startTime = 0;
let offset = 0;
let firsttime = true;
duration.set(0.5);

const anim = new CABLES.Anim();
anim.createPort(op, "easing", init);
anim.loop = false;

duration.onChange =
    inValue.onChange = init;

function init()
{
    startTime = performance.now();
    anim.clear(CABLES.now() / 1000.0);

    if (firsttime) anim.setValue(CABLES.now() / 1000.0, inValue.get());

    anim.setValue(duration.get() + CABLES.now() / 1000.0, inValue.get(), triggerFinished);

    firsttime = false;
}

function triggerFinished()
{
    finished.trigger();
}

exe.onTriggered = function ()
{
    let t = CABLES.now() / 1000;

    if (performance.now() - lastTime > 300)
    {
        firsttime = true;
        init();
    }

    lastTime = performance.now();

    let v = anim.getValue(t);

    result.set(v);
    next.trigger();
};
