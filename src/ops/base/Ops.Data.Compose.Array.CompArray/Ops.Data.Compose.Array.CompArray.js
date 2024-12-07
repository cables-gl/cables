const
    update = op.inTrigger("Update"),
    active = op.inBool("Active", true),
    clear = op.inBool("Clear", true),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Result");

inReset.onTriggered = () =>
{
    outArr.setRef([]);
};

let arr = [];

update.onTriggered = () =>
{
    if (!active.get()) return next.trigger();

    op.patch.frameStore.compArray = op.patch.frameStore.compArray || [];

    if (clear.get())
    {
        arr = [];
    }

    op.patch.frameStore.compArray.push(arr);
    next.trigger();

    outArr.setRef(op.patch.frameStore.compArray.pop());
};
