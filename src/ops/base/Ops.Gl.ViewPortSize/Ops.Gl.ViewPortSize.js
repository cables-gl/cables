const
    exec=op.inTrigger("Exec"),
    next=op.outTrigger("Next"),
    outX=op.outValue("X"),
    outY=op.outValue("Y"),
    outW=op.outValue("Width"),
    outH=op.outValue("Height");

exec.onTriggered=function()
{
    const vp=op.patch.cgl.getViewPort();

    outX.set(vp[0]);
    outY.set(vp[1]);
    outW.set(vp[2]);
    outH.set(vp[3]);

    next.trigger();
};