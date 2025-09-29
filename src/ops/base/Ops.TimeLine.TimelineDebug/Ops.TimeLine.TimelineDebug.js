const
    exec = op.inTrigger("update"),
    outobj = op.outObject("data"),
    outSe = op.outArray("Selected keys");

exec.onTriggered = () =>
{
    if (!CABLES.UI) return;
    let o = {};
    const tl = gui.glTimeline;
    if (tl)
    {
        o = tl.getDebug();
        outSe.set(tl.getSelectedKeys());
    }
    outobj.setRef(o);
};
