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
        pipe = op.patch.frameStore.minigpu.device.createRenderPipeline({
            "layout": "auto",
            "vertex": {
                "module": op.patch.frameStore.minigpu.device.createShaderModule({
                    "code": inVert.get(),
                }),
            },
            "fragment": {
                "module": op.patch.frameStore.minigpu.device.createShaderModule({
                    "code": inFrag.get(),
                }),
                "targets": [
                    {
                        "format": op.patch.frameStore.minigpu.presentationFormat,
                    },
                ],
            },
            "primitive": {
                "topology": "triangle-list",
            },
        });
    }

    if (!pipe) return console.log("no pipe");
    op.patch.frameStore.minigpu.passEncoder.setPipeline(pipe);
    op.patch.frameStore.minigpu.passEncoder.draw(3);

    next.trigger();
};
