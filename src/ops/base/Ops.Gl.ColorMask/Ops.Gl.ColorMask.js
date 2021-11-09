const
    exec = op.inTrigger("Execute"),
    inR = op.inValueBool("Red", true),
    inG = op.inValueBool("Green", true),
    inB = op.inValueBool("Blue", true),
    inA = op.inValueBool("Alpha", true),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;

// var old=cgl.gl.getParameter(cgl.gl.COLOR_WRITEMASK);

exec.onTriggered = function ()
{
    cgl.gl.colorMask(inR.get(), inG.get(), inB.get(), inA.get());
    next.trigger();
    op.patch.cgl.gl.colorMask(true, true, true, true);
};
