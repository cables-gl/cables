const
    exec = op.inTrigger("Trigger"),
    inShader = op.inObject("Shader"),
    next = op.outTrigger("Next");

let pipe = null;

inShader.onChange = () =>
{
    pipe = null;
};

exec.onTriggered = () =>
{
    if (!inShader.get()) return;
    if (!pipe)
    {
        pipe = op.patch.frameStore.minigpu.device.createRenderPipeline({
            "layout": "auto",
            "vertex": inShader.get().vertex,
            "fragment": inShader.get().fragment,
            "primitive": {
                "topology": "triangle-list",
            },
            // "depthStencil": {
            //     "depthWriteEnabled": true,
            //     "depthCompare": "less-equal",
            //     "format": "depth24plus"
            // }

        });
    }

    if (!pipe) return console.log("no pipe");
    op.patch.frameStore.minigpu.passEncoder.setPipeline(pipe);
    op.patch.frameStore.minigpu.passEncoder.draw(3);

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
