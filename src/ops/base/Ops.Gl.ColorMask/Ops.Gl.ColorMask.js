const
    exec=op.inTrigger("Execute"),
    inR=op.inValueBool("Red",true),
    inG=op.inValueBool("Green",true),
    inB=op.inValueBool("Blue",true),
    inA=op.inValueBool("Alpha",true),
    next=op.outTrigger("Next");

const cgl=op.patch.cgl;

exec.onTriggered=function()
{
    var old=cgl.gl.getParameter(cgl.gl.COLOR_WRITEMASK);
    cgl.gl.colorMask(inR.get(),inG.get(),inB.get(),inA.get());
    next.trigger();
    op.patch.cgl.gl.colorMask(old[0],old[1],old[2],old[3]);
};