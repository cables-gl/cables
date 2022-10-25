const exe = op.inTriggerButton("trigger in"),
    reset = op.inTriggerButton("reset"),
    trigger = op.outTrigger("trigger out"),
    num = op.outNumber("current count"),

    inMinLoopValue = op.inValueInt("Loop min", 0.0),
    inMaxLoopValue = op.inValueInt("Loop max", 4.0);

let n = Math.floor(inMinLoopValue.get());

// increments with each trigger and loops
// depending on min and max loop values
// can also work with negative numbers
// if min is greater than max then it decrements
// instead of incrementing
exe.onTriggered = function ()
{
    let inMin = Math.floor(inMinLoopValue.get());
    let inMax = Math.floor(inMaxLoopValue.get());

    if (inMin < inMax)
    {
        if (n < inMin)
        {
            n = inMinLoopValue.get();
        }
        else if (n >= inMax)
        {
            n = inMinLoopValue.get();
        }
        else
        {
            n++;
        }
    }
    else if (inMin > inMax)
    {
        if (n < inMax)
        {
            n = inMin;
        }
        else if (n > inMin)
        {
            inMin;
        }
        else if (n <= inMax)
        {
            n = inMin;
        }
        else
        {
            n--;
        }
    }
    num.set(n);
    op.setUiAttrib({ "extendTitle": n });
    trigger.trigger();
};

reset.onTriggered = function ()
{
    let inMin = Math.floor(inMinLoopValue.get());
    let inMax = Math.floor(inMaxLoopValue.get());

    if (inMin < inMax)
    {
        n = inMin;
    }
    else if (inMax < inMin)
    {
        n = inMin;
    }
    else
    {
        n = 0;
    }
    op.setUiAttrib({ "extendTitle": n });
    num.set(n);
};
