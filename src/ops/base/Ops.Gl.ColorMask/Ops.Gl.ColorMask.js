const
    exec = op.inTrigger("Execute"),
    inR = op.inBool("Red", true),
    inG = op.inBool("Green", true),
    inB = op.inBool("Blue", true),
    inA = op.inBool("Alpha", true),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;

exec.onTriggered = function ()
{
    let old = cgl.gl.getParameter(cgl.gl.COLOR_WRITEMASK);
    cgl.gl.colorMask(inR.get(), inG.get(), inB.get(), inA.get());
    next.trigger();
    op.patch.cgl.gl.colorMask(old[0], old[1], old[2], old[3]);
};
