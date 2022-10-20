const
    inVal = op.inValue("Delta"),

    snapVals = op.inArray("Snap at Values"),
    snapDist = op.inValue("Snap Distance"),
    snapDistRelease = op.inValue("Snap Distance Release"),
    inSlow = op.inValue("Slowdown", 0.4),
    inBlock = op.inValue("Block Input after snap"),
    inReset = op.inTriggerButton("Reset"),
    inMin = op.inValue("Min", 0),
    inMax = op.inValue("Max", 0),

    inMul = op.inValue("Value Mul", 1),
    inEnabled = op.inValueBool("Enabled", true),

    outVal = op.outNumber("Result"),
    outDist = op.outNumber("Distance"),
    outSnapped = op.outBoolNum("Snapped"),
    outWasSnapped = op.outBoolNum("was snapped");

inVal.onChange = update;
inVal.changeAlways = true;

let snapped = false;
let val = 0;
let hasError = false;
let timeout = 0;
let blocking = false;
let lastValue = -1;
let snappedArr = [];

snapVals.onChange = checkError;

inReset.onTriggered = function ()
{
    val = 0;
    outVal.set(val);
    // update();
};

function checkError()
{
    let snaps = snapVals.get();
    if (!snaps || snaps.length == 0)
    {
        op.setUiError("snapsnull", "needs array containing snap points");
        hasError = true;
        return;
    }

    if (hasError)
    {
        op.setUiError("snapsnull", null);
        hasError = false;
        setTimeout(update, 500);
    }

    snappedArr = [];
    for (let i = 0; i < snapVals.length; i++)
    {
        snappedArr[i] = false;
    }
}

function update()
{
    if (blocking) return;
    let snaps = snapVals.get();

    let d = 999999999;
    let snapvalue = 0;
    let currentIndex = -1;

    for (let i = 0; i < snaps.length; i++)
    {
        let dd = Math.abs(val - snaps[i]) + 0.01;
        if (dd < d)
        {
            d = dd;
            snapvalue = snaps[i];
            currentIndex = i;
        }

        if (val > snaps[i] && !snappedArr[i])
        {
            val = snaps[i];
            d = 0;
            currentIndex = i;
        }
    }

    if (d === 0) return;
    if (inVal.get() === 0) return;

    if (d < snapDistRelease.get())
    {
        let vv = inVal.get() * Math.abs(((d / snapDistRelease.get()) * inSlow.get())) * inMul.get();
        val += vv;

        clearTimeout(timeout);

        timeout = setTimeout(function ()
        {
            val = snapvalue;
            outVal.set(val);
        }, 250);
    }
    else
    {
        clearTimeout(timeout);
        val += inVal.get();
    }

    if (!inEnabled.get())
    {
        outVal.set(val);
        lastValue = val;
    }

    inVal.set(0);

    d = Math.abs(val - snapvalue);
    outDist.set(d);
    let wassnapped = false;

    if (d > snapDist.get())
    {
        snapped = false;
        wassnapped = false;
    }

    if (!snapped)
    {
        if (d < snapDist.get())
        {
            val = snapvalue;
            if (inBlock.get() > 0)
            {
                blocking = true;
                setTimeout(function ()
                {
                    blocking = false;
                }, inBlock.get() * 1000);
            }
            snappedArr[currentIndex] = true;
            snapped = true;
            wassnapped = true;
        }
        else
        {
            snapped = false;
        }
    }

    outSnapped.set(snapped);
    outWasSnapped.set(wassnapped);

    if (inMax.get() != inMin.get() != 0)
    {
        if (val > inMax.get())val = inMax.get();
        else if (val < inMin.get())val = inMin.get();
    }

    outVal.set(val);
    lastValue = val;
}
