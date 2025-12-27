const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inV = op.inFloat("Value"),
    next = op.outTrigger("Next");

exec.onTriggered = () =>
{
    if (op.patch.frameStore.mgpu.shader)
        op.patch.frameStore.mgpu.shader.current().fragment.constants[inName.get()] = inV.get();

    next.trigger();
};
