const
    update = op.inTrigger("Update"),
    inIndex = op.inFloat("Index", 0),
    inObject = op.inObject("Object"),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    if (op.patch.tempData.compArray && op.patch.tempData.compArray.length > 0)
    {
        let arr = op.patch.tempData.compArray[op.patch.tempData.compArray.length - 1];
        arr[inIndex.get()] = inObject.get();
    }
    next.trigger();
};
