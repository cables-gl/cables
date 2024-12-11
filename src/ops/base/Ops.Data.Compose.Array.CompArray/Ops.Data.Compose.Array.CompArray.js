const
    update = op.inTrigger("Update"),
    active = op.inBool("Active", true),
    clear = op.inBool("Clear", true),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Result");

inReset.onTriggered = () =>
{
    arr = [];
    outArr.setRef([]);
};

let arr = [];

update.onTriggered = () =>
{
    if (!active.get()) return next.trigger();

    op.patch.tempData.compArray = op.patch.tempData.compArray || [];

    if (clear.get())
    {
        arr = [];
    }

    op.patch.tempData.compArray.push(arr);
    next.trigger();

    outArr.setRef(op.patch.tempData.compArray.pop());
};
