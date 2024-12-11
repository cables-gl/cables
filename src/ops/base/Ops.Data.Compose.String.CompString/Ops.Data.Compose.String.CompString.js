const
    update = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    outArr = op.outString("Result");

update.onTriggered = () =>
{
    op.patch.tempData.compString = op.patch.tempData.compString || "";

    op.patch.tempData.compString = "";
    next.trigger();

    outArr.setRef(op.patch.tempData.compString);
};
