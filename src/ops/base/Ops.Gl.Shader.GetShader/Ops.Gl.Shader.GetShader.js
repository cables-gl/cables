const
    inTrigger = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    outShader = op.outObject("Shader");

inTrigger.onTriggered = () =>
{
    if (op.patch.cgl.frameStore.shadowPass) return;
    outShader.set(op.patch.cgl.getShader());
    next.trigger();
};
