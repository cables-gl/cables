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
    op.patch.tempData.compObject = op.patch.tempData.compObject || [];

    if (inClear.get())obj = {};
    op.patch.tempData.compObject.push(obj);
    next.trigger();

    outArr.setRef(op.patch.tempData.compObject.pop());
};
