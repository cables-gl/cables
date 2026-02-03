const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inV = op.inFloat("Value"),
    next = op.outTrigger("Next");

let reninit = true;

inName.onChange =
inV.onChange = () =>
{
    reninit = true;
};

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;

    if (reninit && mgpu.constants)
    {
        mgpu.constants[inName.get()] = inV.get();
        mgpu.shader.updated = true;
    }

    next.trigger();
};
