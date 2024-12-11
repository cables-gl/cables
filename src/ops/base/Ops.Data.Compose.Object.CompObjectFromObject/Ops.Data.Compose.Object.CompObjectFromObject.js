const
    update = op.inTrigger("Update"),
    inArr = op.inObject("Object"),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    if (op.patch.tempData.compObject && op.patch.tempData.compObject.length > 0)
    {
        let arr = op.patch.tempData.compObject[op.patch.tempData.compObject.length - 1];

        try
        {
            const newArr = inArr.get() || [];

            for (const i in newArr)
            {
                arr[i] = newArr[i];
            }
        }
        catch (e)
        {
            op.log("error comparraupusharray");
        }
    }
    next.trigger();
};
