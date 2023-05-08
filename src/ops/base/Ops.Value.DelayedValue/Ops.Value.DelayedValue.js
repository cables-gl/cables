const
    exe = op.inTrigger("Update"),
    v = op.inValue("Value", 0),
    delay = op.inValue("Delay", 0.5),
    result = op.outNumber("Result", 0),
    clear = op.inValueBool("Clear on Change", false);

const anim = new CABLES.Anim();
anim.createPort(op, "easing", function () {}).set("absolute");

exe.onTriggered = function ()
{
    result.set(anim.getValue(op.patch.freeTimer.get()) || 0);
};

v.onChange = function ()
{
    const current = anim.getValue(op.patch.freeTimer.get());
    const t = op.patch.freeTimer.get();

    if (clear.get()) anim.clear(t);

    anim.setValue(t + delay.get(), v.get());

    let lastKey = 0;
    for (let i = 0; i < anim.keys.length; i++)
        if (anim.keys[i] && anim.keys[i].time < t)lastKey = i;

    if (lastKey > 2) anim.keys.splice(0, lastKey);
};
