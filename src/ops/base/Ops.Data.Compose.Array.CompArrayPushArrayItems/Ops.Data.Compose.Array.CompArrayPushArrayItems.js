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
            const newArr = inArr.get() || [];

            for (let i = 0; i < newArr.length; i++)
            {
                arr.push(newArr[i]);
            }
        }
        catch (e)
        {
            op.log("error comparraupusharray");
        }
    }
    next.trigger();
};
