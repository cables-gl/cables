const
    inUpdate = op.inTrigger("update"),
    inBang = op.inTriggerButton("Bang"),
    inDuration = op.inValue("Duration", 0.1),
    invert = op.inBool("Invert", false),
    outTrigger = op.outTrigger("Trigger Out"),
    outValue = op.outNumber("Value");

const anim = new CABLES.Anim();
let startTime = CABLES.now();
op.toWorkPortsNeedToBeLinked(inUpdate);

let needsReset = false;

inBang.onTriggered = function ()
{
    needsReset = true;
};

inUpdate.onTriggered = function ()
{
    if (needsReset)
    {
        startTime = CABLES.now();
        anim.clear();
        anim.setValue(0, 1);
        anim.setValue(inDuration.get(), 0);
        needsReset = false;
    }

    const elapsed = (CABLES.now() - startTime) / 1000;
    if (elapsed <= inDuration.get())
    {
        const v = anim.getValue(elapsed);
        if (invert.get()) outValue.set(1.0 - v);
        else outValue.set(v);
    }
    else
    {
        if (invert.get())
        {
            outValue.set(1.0);
        }
        else
        {
            outValue.set(0);
        }
    }

    outTrigger.trigger();
};
