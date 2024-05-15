const
    exec = op.inTriggerButton("Trigger"),
    inObj = op.inObject("Object"),
    inKey = op.inString("Key"),
    inValue = op.inFloat("Number"),
    next = op.outTrigger("Next"),
    outObj = op.outObject("Result");

inKey.setUiAttribs({ "stringTrim": true, "minLength": 1 });

exec.onTriggered = () =>
{
    const obj = inObj.get();

    if (obj && inKey.get())
    {
        obj[inKey.get()] = inValue.get();
    }

    outObj.setRef(obj);

    next.trigger();
};
