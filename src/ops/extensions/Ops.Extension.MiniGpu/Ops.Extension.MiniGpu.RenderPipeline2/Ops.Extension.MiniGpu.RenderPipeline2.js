const
    exec = op.inTrigger("Trigger"),
    inShader = op.inObject("Frag"),
    inShaderVert = op.inObject("Vert"),
    inInstances = op.inInt("Instances", 100),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next");

let pipe = null;
let oldShader = null;
let bindGroup = null;

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
        const binds = [...inShader.get().bindings.array(), ...inShaderVert.get().bindings.array()];
        console.log("binds", binds);
        const bindGroupLayout = MGPU.createBindGroupLayout(mgpu, binds);

        console.log("inShaderVert", inShaderVert.get());
        console.log("inShaderVert", inShader.get());

        const o = {

            "layout": mgpu.device.createPipelineLayout({
                "bindGroupLayouts": [bindGroupLayout],
            }),
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
        bindGroup = MGPU.createBindGroup(mgpu, binds, bindGroupLayout);

        pipe = mgpu.device.createRenderPipeline(o);
    }

    if (!pipe) return console.log("no pipe");
    mgpu.passEncoder.setPipeline(pipe);
    mgpu.passEncoder.setBindGroup(0, bindGroup);

    mgpu.passEncoder.draw(6, inInstances.get());

    next.trigger();
};
