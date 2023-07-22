const
    update = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    outArr = op.outString("Result");

update.onTriggered = () =>
{
    op.patch.frameStore.compString = op.patch.frameStore.compString || "";

    op.patch.frameStore.compString = "";
    next.trigger();

    outArr.setRef(op.patch.frameStore.compString);
};
