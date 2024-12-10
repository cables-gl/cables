const
    update = op.inTrigger("Update"),
    inArr = op.inArray("Array"),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    if (op.patch.tempData.compArray && op.patch.tempData.compArray.length > 0)
    {
        let arr = op.patch.tempData.compArray[op.patch.tempData.compArray.length - 1];

        try
        {
            arr.push(JSON.parse(JSON.stringify(inArr.get())));
        }
        catch (e)
        {
            op.log("error comparraupusharray");
        }
    }
    next.trigger();
};
