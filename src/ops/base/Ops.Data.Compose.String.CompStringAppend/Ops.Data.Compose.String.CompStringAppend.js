const
    update = op.inTrigger("Update"),
    inDir = op.inSwitch("Direction", ["End", "Begin"], "End"),
    inStr = op.inString("String", "."),
    inAddBreak = op.inBool("Add Break", false),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    op.patch.tempData.compString = op.patch.tempData.compString || "";

    if (inDir.get() == "End") op.patch.tempData.compString += inStr.get();
    else op.patch.tempData.compString = inStr.get() + op.patch.tempData.compString;

    if (inAddBreak.get())op.patch.tempData.compString += "\n";

    next.trigger();
};
