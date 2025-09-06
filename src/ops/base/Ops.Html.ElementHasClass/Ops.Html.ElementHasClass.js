const inEle = op.inObject("Element", null, "element"),
    inClassName = op.inString("Classname", ""),
    inUpdate = op.inTrigger("Update"),
    outFound = op.outBoolNum("Has Class");

inUpdate.onTriggered =
inEle.onChange =
inClassName.onChange = () =>
{
    const ele = inEle.get();
    if (!ele || !ele.classList)
    {
        outFound.set(false);
        return;
    }

    outFound.set(ele.classList.contains(inClassName.get()));
};
