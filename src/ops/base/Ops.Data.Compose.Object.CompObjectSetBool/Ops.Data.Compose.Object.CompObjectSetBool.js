const
    update = op.inTrigger("Update"),
    inKey = op.inString("Key", ""),
    inBool = op.inBool("Boolean", true),
    next = op.outTrigger("Next");

op.setUiAttrib({ "extendTitlePort": inKey.name });
inKey.setUiAttribs({ "stringTrim": true });

update.onTriggered = () =>
{
    if (op.patch.frameStore.compObject && op.patch.frameStore.compObject.length > 0)
    {
        let obj = op.patch.frameStore.compObject[op.patch.frameStore.compObject.length - 1];
        obj[inKey.get()] = !!inBool.get();
    }
    next.trigger();
};
