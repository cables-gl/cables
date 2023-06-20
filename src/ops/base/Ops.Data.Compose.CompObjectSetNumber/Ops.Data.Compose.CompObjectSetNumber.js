const
    update = op.inTrigger("Update"),
    inKey = op.inString("Key", ""),
    inNum = op.inFloat("Number", 0),
    next = op.outTrigger("Next");

op.setUiAttrib({ "extendTitlePort": inKey.name });

update.onTriggered = () =>
{
    if (op.patch.frameStore.compObject && op.patch.frameStore.compObject.length > 0)
    {
        let obj = op.patch.frameStore.compObject[op.patch.frameStore.compObject.length - 1];
        obj[inKey.get()] = inNum.get();
    }
    next.trigger();
};
