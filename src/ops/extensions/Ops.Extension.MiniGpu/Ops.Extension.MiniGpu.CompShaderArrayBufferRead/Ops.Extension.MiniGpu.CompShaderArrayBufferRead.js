const
    exec = op.inTrigger("Trigger"),
    outO = op.inObject("Buffer"),
    inOut = op.inBool("InOut Buffers", false),
    next = op.outTrigger("Next");

let buffer = null;
let binding = null;

let bufferInOut = null;
let bindingInOut = null;

inOut.onChange = () =>
{
    buffer = null;
};

outO.onChange = () =>
{
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

        const p = (buffer.label || "").split(",");

        /* minimalcore:start */
        op.setUiAttrib({ "extendTitle": p[0] + "<" + p[1] + ">" });

        /* minimalcore:end */

        const layout = {
            "visibility": mgpu.stage,
            "buffer":
            {
                "type": "read-only-storage"
            }
        };

        binding = {
            "header": "var<storage,read> " + p[0] + " : array<" + p[1] + ">;",
            "resource": { "buffer": buffer },
            "layout": layout
        };
        mgpu.rebuildShaderModule = "new buffer read: " + buffer.label;

        if (inOut.get())
        {

            const layout = {
                "visibility": mgpu.stage,
                "buffer":
                {
                    "type": "storage"
                }
            };

            bindingInOut = {
                "header": "var<storage,read_write> " + p[0] + "Out : array<" + p[1] + ">;",
                "resource": { "buffer": buffer },
                "layout": layout
            };
        }
        else bindingInOut = null;
    }

    if (binding) mgpu.bindings.push(binding);
    if (bindingInOut) mgpu.bindings.push(bindingInOut);

    next.trigger();
};
