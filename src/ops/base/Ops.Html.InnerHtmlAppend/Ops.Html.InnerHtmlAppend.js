const
    inEle = op.inObject("Element", null, "element"),
    inStr = op.inString("Html", ""),
    exec = op.inTriggerButton("Trigger");

exec.onTriggered = () =>
{
    const el = inEle.get();
    if (el)
    {
        el.innerHTML += inStr.get();
    }
};
