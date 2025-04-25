const
    exec = op.inTrigger("update"),
    outobj = op.outObject("data");

exec.onTriggered = () =>
{
    if (!CABLES.UI) return;
    let o = {};
    const tl = gui.glTimeline;
    if (tl)
    {
        o = tl.getDebug();
    }
    outobj.setRef(o);
};
