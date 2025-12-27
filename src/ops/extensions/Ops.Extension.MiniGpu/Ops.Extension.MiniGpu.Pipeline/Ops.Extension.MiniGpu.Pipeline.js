const
    exec = op.inTrigger("Trigger"),
    inFrag = op.inStringEditor("Fragment Shader", "", "wgsl"),
    inVert = op.inStringEditor("Vertex Shader", "", "wgsl"),
    next = op.outTrigger("Next");

let pipe = null;

exec.onTriggered = () =>
{
    if (!pipe)
    {
        pipe = op.patch.frameStore.mgpu.device.createRenderPipeline({
            "layout": "auto",
            "vertex": {
                "module": op.patch.frameStore.mgpu.device.createShaderModule({
                    "code": inVert.get(),
                }),
            },
            "fragment": {
                "module": op.patch.frameStore.mgpu.device.createShaderModule({
                    "code": inFrag.get(),
                }),
                "targets": [
                    {
                        "format": op.patch.frameStore.mgpu.presentationFormat,
                    },
                ],
            },
            "primitive": {
                "topology": "triangle-list",
            },
        });
    }

    if (!pipe) return console.log("no pipe");
    op.patch.frameStore.mgpu.passEncoder.setPipeline(pipe);
    op.patch.frameStore.mgpu.passEncoder.draw(3);

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
