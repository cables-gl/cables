const
    inTrigger = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    outShader = op.outObject("Shader");

inTrigger.onTriggered = () =>
{
    outShader.set(op.patch.cgl.getShader());
    next.trigger();
};
