const
    update = op.inTrigger("Update"),
    inClear = op.inBool("Clear", true),
    reset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outArr = op.outObject("Result");

let obj = {};

reset.onTriggered = () =>
{
    obj = {};
    outArr.setRef(obj);
};

update.onTriggered = () =>
{
    op.patch.frameStore.compObject = op.patch.frameStore.compObject || [];

    if (inClear.get())obj = {};
    op.patch.frameStore.compObject.push(obj);
    next.trigger();

    outArr.setRef(op.patch.frameStore.compObject.pop());
};
