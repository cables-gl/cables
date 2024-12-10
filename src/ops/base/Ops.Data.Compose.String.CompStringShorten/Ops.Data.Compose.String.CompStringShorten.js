const
    update = op.inTrigger("Update"),
    inDir = op.inSwitch("Direction", ["End", "Begin"], "End"),
    inNum = op.inInt("Num Chars", 3),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    op.patch.tempData.compString = op.patch.tempData.compString || "";

    if (inDir.get() == "End")
        op.patch.tempData.compString = op.patch.tempData.compString.substr(0, Math.min(op.patch.tempData.compString.length, op.patch.tempData.compString.length - inNum.get()));
    else
        op.patch.tempData.compString = op.patch.tempData.compString.substr(inNum.get());

    next.trigger();
};
