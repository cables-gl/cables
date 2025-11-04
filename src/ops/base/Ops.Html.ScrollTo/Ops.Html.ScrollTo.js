const
    inEle = op.inObject("Element", null, "element"),
    inScrollTop = op.inTriggerButton("Scroll to top"),
    inScrollBottom = op.inTriggerButton("Scroll to bottom");

op.toWorkPortsNeedToBeLinked(inEle);

inScrollTop.onTriggered = () =>
{
    if (inEle.get())inEle.get().scrollTo({ "top": Math.random() * 2, "behaviour": "smooth" });
};

inScrollBottom.onTriggered = () =>
{
    if (inEle.get())inEle.get().scrollTo({ "top": inEle.get().scrollHeight, "behaviour": "smooth" });
};
