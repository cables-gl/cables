const
    exec = op.inTrigger("Trigger"),
    inShader = op.inObject("Shader"),
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
    if (!inShader.get() || !inShader.get().fragment) return;
    if (!pipe)
    {
        const o = {
            "layout": "auto",
            "vertex": inShader.get().vertex,
            "fragment": inShader.get().fragment,
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

        pipe = op.patch.frameStore.mgpu.device.createRenderPipeline(o);
    }

    if (!pipe) return console.log("no pipe");
    op.patch.frameStore.mgpu.passEncoder.setPipeline(pipe);
    // op.patch.frameStore.mgpu.passEncoder.setVertexBuffer(0, inVertex.get());
    // op.patch.frameStore.mgpu.passEncoder.draw(inVertex.get().size / 12);
    op.patch.frameStore.mgpu.passEncoder.draw(12);

    next.trigger();
};

//   primitive: {
//     topology: 'line-list',
//   },
//   depthStencil: {
//     depthWriteEnabled: true,
//     depthCompare: 'less-equal',
//     format: depthFormat,
//   },
