const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inV = op.inFloat("Value"),
    next = op.outTrigger("Next");

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (mgpu.constants)
        mgpu.constants[inName.get()] = inV.get();

    next.trigger();
};
