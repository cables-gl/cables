const
    update = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    result = op.outNumber("Result", 0);

update.onTriggered = () =>
{
    if (op.patch.tempData.compArray && op.patch.tempData.compArray.length > 0)
    {
        let arr = op.patch.tempData.compArray[op.patch.tempData.compArray.length - 1];
        result.set(arr.pop());
    }
    next.trigger();
};
