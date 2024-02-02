const
    update = op.inTrigger("Update"),
    inDir = op.inSwitch("Direction", ["End", "Begin"], "End"),
    inNum = op.inInt("Num Chars", 3),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    op.patch.frameStore.compString = op.patch.frameStore.compString || "";

    if (inDir.get() == "End")
        op.patch.frameStore.compString = op.patch.frameStore.compString.substr(0, Math.min(op.patch.frameStore.compString.length, op.patch.frameStore.compString.length - inNum.get()));
    else
        op.patch.frameStore.compString = op.patch.frameStore.compString.substr(inNum.get());

    next.trigger();
};
