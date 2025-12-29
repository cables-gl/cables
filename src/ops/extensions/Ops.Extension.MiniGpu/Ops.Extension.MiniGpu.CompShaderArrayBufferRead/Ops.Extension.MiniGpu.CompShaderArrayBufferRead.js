const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next"),
    outO = op.inObject("Buffer");

let buffer = null;
let binding = null;

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!buffer)
    {
        buffer = outO.get();
        /* minimalcore:start */
        op.setUiAttrib({ "extendTitle": buffer.label });
        /* minimalcore:end */

        const layout = {
            "visibility": GPUShaderStage.VERTEX,

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
        // outO.setRef(buffer);
    }

    mgpu.bindings.push(binding);

    next.trigger();
};
