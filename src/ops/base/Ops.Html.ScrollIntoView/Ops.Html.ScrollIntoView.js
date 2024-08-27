const
    inEle = op.inObject("Element"),
    inBehaviour = op.inSwitch("Behaviour", ["smooth", "instant"], "smooth"),
    inScroll = op.inTriggerButton("Scroll Into View"),
    outEle = op.outObject("HTML Element");

inScroll.onTriggered = update;

inEle.onChange = () =>
{
    outEle.setRef(inEle.get());
};

function update()
{
    const ele = inEle.get();

    if (ele && ele.scrollIntoView)
    {
        ele.scrollIntoView({ "behavior": inBehaviour.get(), "block": "end", "inline": "nearest" });
    }
}