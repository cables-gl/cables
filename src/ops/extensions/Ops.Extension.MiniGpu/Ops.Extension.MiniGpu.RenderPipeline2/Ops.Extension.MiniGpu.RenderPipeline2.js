const
    exec = op.inTrigger("Trigger"),
    inShader = op.inObject("Frag"),
    inShaderVert = op.inObject("Vert"),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next");

let pipe = null;
let oldShader = null;

inReset.onTriggered = () =>
{
    pipe = null;
};

inShader.onChange = () =>
{
    if (inShader.get() != oldShader)pipe = null;
    oldShader = inShader.get();
};

exec.onTriggered = () =>
{
    if (!inShader.get() || !inShaderVert.get()) return;
    if (!inShader.get().shader || !inShaderVert.get().shader) return;

    const mgpu = op.patch.frameStore.mgpu;

    if (!pipe)
    {
        console.log("inShaderVert", inShaderVert.get());
        console.log("inShaderVert", inShader.get());
        const o = {
            "layout": "auto",
            "vertex": inShaderVert.get().shader.vertex,
            "fragment": inShader.get().shader.fragment,
            "primitive": {
                "topology": "triangle-list",
                // "topology": "point-list",
            },
            // "depthStencil": {
            //     "depthWriteEnabled": true,
            //     "depthCompare": "less-equal",
            //     "format": "depth24plus"
            // }
        };
        console.log("ooooooooo", o);
        pipe = mgpu.device.createRenderPipeline(o);
    }

    if (!pipe) return console.log("no pipe");
    mgpu.passEncoder.setPipeline(pipe);

    mgpu.passEncoder.draw(12);

    next.trigger();
};
