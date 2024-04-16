const
    update = op.inTrigger("Update"),
    inKey = op.inString("Key", ""),
    inObj = op.inObject("Object"),
    next = op.outTrigger("Next");

op.setUiAttrib({ "extendTitlePort": inKey.name });

inKey.setUiAttribs({ "stringTrim": true });

update.onTriggered = () =>
{
    if (op.patch.frameStore.compObject && op.patch.frameStore.compObject.length > 0)
    {
        let obj = op.patch.frameStore.compObject[op.patch.frameStore.compObject.length - 1];
        obj[inKey.get()] = inObj.get();
    }
    next.trigger();
};
