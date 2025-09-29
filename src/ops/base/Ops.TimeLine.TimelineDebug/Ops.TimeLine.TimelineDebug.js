const
    exec = op.inTrigger("update"),
    outobj = op.outObject("data"),
    outTime = op.outNumber("Time Cursor"),
    outTimeDur = op.outNumber("Visible Duration"),
    outTimeLeft = op.outNumber("Visible Time Start"),
    outLoopStart = op.outNumber("Loop Start"),
    outLoopEnd = op.outNumber("Loop End"),
    outSelNum = op.outNumber("Num selected Keys"),
    outSelValMin = op.outNumber("Selected Values Min"),
    outSelValMax = op.outNumber("Selected Values Max"),
    outSelTimeMin = op.outNumber("Selected Times Min"),
    outSelTimeMax = op.outNumber("Selected Times Max"),
    outSe = op.outArray("Selected keys");

exec.onTriggered = () =>
{
    if (!CABLES.UI) return;
    let o = {};
    const tl = gui.glTimeline;
    if (tl)
    {
        o = tl.getDebug();

        const boundsSelValue = tl.getSelectedKeysBoundsValue();
        const boundsSelTime = tl.getSelectedKeysBoundsTime();
        const selKeys = tl.getSelectedKeys();

        outSelNum.set(selKeys.length);
        outSelValMin.set(boundsSelValue.min);
        outSelValMax.set(boundsSelValue.max);
        outSelTimeMin.set(boundsSelTime.min);
        outSelTimeMax.set(boundsSelTime.max);

        outSe.set(selKeys);
        outTimeLeft.set(tl.view.timeLeft);
        outTimeDur.set(tl.view.timeRight - tl.view.timeLeft);
        outTime.set(tl.view.cursorTime);
        outLoopStart.set(tl.loopAreaStart);
        outLoopEnd.set(tl.loopAreaEnd);
    }
    outobj.setRef(o);
};
