const
    update = op.inTrigger("Update"),
    inStr = op.inString("String", ""),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    if (op.patch.frameStore.compArray && op.patch.frameStore.compArray.length > 0)
    {
        let arr = op.patch.frameStore.compArray[op.patch.frameStore.compArray.length - 1];
        arr.push(inStr.get());
    }
    next.trigger();
};
