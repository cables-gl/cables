const
    exe = op.inTrigger("Execute"),
    arr = op.inArray("Array"),
    pStep = op.inValue("Step"),
    trigger = op.outTrigger("Trigger"),
    idx = op.outNumber("Index"),
    valX = op.outNumber("Value 1"),
    valY = op.outNumber("Value 2"),
    valZ = op.outNumber("Value 3");

let ar = arr.get() || [];

let vstep = 1;
pStep.onChange = changeStep;
changeStep();

let i = 0;
let count = 0;

arr.onChange = function ()
{
    ar = arr.get() || [];
};

function changeStep()
{
    vstep = pStep.get() || 1;
    if (vstep < 1.0)vstep = 1.0;
    vstep = 3 * vstep;
}

exe.onTriggered = function ()
{
    count = 0;

    for (let i = 0, len = ar.length; i < len; i += vstep)
    // for (var i = ar.length-1; i >=0; i-=vstep)
    {
        idx.set(count);
        valX.set(ar[i + 0]);
        valY.set(ar[i + 1]);
        valZ.set(ar[i + 2]);
        trigger.trigger();
        count++;
    }
};
