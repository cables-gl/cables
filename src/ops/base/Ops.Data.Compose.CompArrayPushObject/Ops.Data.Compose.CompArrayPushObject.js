const
    update = op.inTrigger("Update"),
    inObj = op.inObject("Object"),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    if (op.patch.frameStore.compArray && op.patch.frameStore.compArray.length > 0)
    {
        let arr = op.patch.frameStore.compArray[op.patch.frameStore.compArray.length - 1];

        try
        {
            arr.push(JSON.parse(JSON.stringify(inObj.get())));
        }
        catch (e)
        {
            op.log("error comparraupusharray");
        }
    }
    next.trigger();
};
