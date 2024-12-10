const
    update = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Result");

update.onTriggered = () =>
{
    if (op.patch.tempData.compArray && op.patch.tempData.compArray.length > 0)
    {
        try
        {
            outArr.setRef(JSON.parse(JSON.stringify(op.patch.tempData.compArray[op.patch.tempData.compArray.length - 1])));
        }
        catch (e)
        {
            op.log(e);
        }
    }

    next.trigger();
};
