const
    update = op.inTrigger("Update"),
    inNum1 = op.inFloat("Number", 0),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    if (op.patch.frameStore.compArray && op.patch.frameStore.compArray.length > 0)
    {
        let arr = op.patch.frameStore.compArray[op.patch.frameStore.compArray.length - 1];
        if (arr) arr.push(inNum1.get());
    }
    next.trigger();
};
