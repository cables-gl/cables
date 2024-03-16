const
    inTrig = op.inTrigger("Render"),
    inActive = op.inBool("Active", true),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;

inTrig.onTriggered = () =>
{
    let oit = inActive.get();

    if (oit)
    {
        cgl.pushBlend(true);

        cgl.gl.blendEquationSeparate(cgl.gl.FUNC_ADD, cgl.gl.FUNC_ADD);
        cgl.gl.blendFuncSeparate(cgl.gl.ONE, cgl.gl.ONE, cgl.gl.ZERO, cgl.gl.ONE_MINUS_SRC_ALPHA);
    }

    next.trigger();
    if (oit)
        cgl.gl.blendFunc(cgl.gl.ONE_MINUS_SRC_ALPHA, cgl.gl.SRC_ALPHA);
};
