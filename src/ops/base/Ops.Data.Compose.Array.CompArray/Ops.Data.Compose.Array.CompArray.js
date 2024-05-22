const
    update = op.inTrigger("Update"),
    active = op.inBool("Active", true),
    inReset = op.inTrigger("Reset"),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Result");

inReset.onTriggered = () =>
{
    outArr.setRef([]);
};

update.onTriggered = () =>
{
    if (!active.get()) return next.trigger();

    op.patch.frameStore.compArray = op.patch.frameStore.compArray || [];

    let arr = [];
    op.patch.frameStore.compArray.push(arr);
    next.trigger();

    outArr.setRef(op.patch.frameStore.compArray.pop());
};
