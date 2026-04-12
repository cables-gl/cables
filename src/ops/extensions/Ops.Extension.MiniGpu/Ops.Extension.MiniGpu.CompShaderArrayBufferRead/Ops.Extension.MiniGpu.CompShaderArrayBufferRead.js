const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next"),
    outO = op.inObject("Buffer");

let buffer = null;
let binding = null;

outO.onChange = () =>
{
    // console.log("outooo", outO.get());
    const newBuffer = outO.get();
    if (newBuffer != buffer)
        buffer = null; // when needed.........???
};

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!buffer)
    {
        buffer = outO.get();
        if (!buffer) return;
        /* minimalcore:start */
        op.setUiAttrib({ "extendTitle": buffer.label });
        /* minimalcore:end */

        const layout = {
            "visibility": mgpu.stage,
            "buffer": {
                "type": "read-only-storage",
            },
        };

        const p = (buffer.label || "").split(",");

        binding = {
            "header": "var<storage,read> " + p[0] + " : array<" + p[1] + ">;",
            "resource": { "buffer": buffer },
            "layout": layout
        };
        mgpu.rebuildShaderModule = "new buffer read: " + buffer.label;
    }

    mgpu.bindings.push(binding);

    next.trigger();
};
