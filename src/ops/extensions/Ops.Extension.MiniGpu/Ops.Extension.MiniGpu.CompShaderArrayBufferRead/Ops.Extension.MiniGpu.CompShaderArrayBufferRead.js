const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    inType = op.inString("Type", "vec4f"),
    inLength = op.inInt("Length"),
    next = op.outTrigger("Next"),
    outO = op.inObject("Buffer");

let buffer = null;
let binding = null;

inLength.onChange =
inType.onChange =
inName.onChange = () =>
{
    buffer = null;
};

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!buffer)
    {
        buffer = outO.get();

        const layout = {
            "visibility": GPUShaderStage.VERTEX,

            "buffer": {
                "type": "read-only-storage",
            },
        };

        binding = {
            "header": "var<storage,read> " + inName.get() + " : array<" + inType.get() + ">;",
            "resource": { "buffer": buffer },
            "layout": layout
        };
        outO.setRef(buffer);
    }

    mgpu.bindings.push(binding);

    next.trigger();
};
