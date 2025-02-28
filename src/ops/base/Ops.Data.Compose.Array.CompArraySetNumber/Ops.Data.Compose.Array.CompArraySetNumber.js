const
    update = op.inTrigger("Update"),
    inIndex = op.inFloat("Index", 0),
    inNum1 = op.inFloat("Number", 0),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    if (op.patch.tempData.compArray && op.patch.tempData.compArray.length > 0)
    {
        let arr = op.patch.tempData.compArray[op.patch.tempData.compArray.length - 1];
        // if (arr) arr.push(inNum1.get());
        arr[inIndex.get()] = inNum1.get();
    }
    next.trigger();
};
