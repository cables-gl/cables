const
    update = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    clear = op.inBool("clear", true),
    reset = op.inTriggerButton("Reset"),
    outArr = op.outString("Result");

let shouldClear = false;
reset.onTriggered = () =>
{
    shouldClear = true;
};

update.onTriggered = () =>
{
    op.patch.tempData.compString = op.patch.tempData.compString || "";
    if (clear.get() || shouldClear)
        op.patch.tempData.compString = "";
    next.trigger();
    shouldClear = false;

    outArr.setRef(op.patch.tempData.compString);
};
