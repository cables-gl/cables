const
    exec = op.inTrigger("Trigger"),
    inShaderFrag = op.inObject("Frag"),
    inShaderVert = op.inObject("Vert"),
    inInstances = op.inInt("Instances", 100),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next");

let pipe = null;
let oldShader = null;
let bindGroupLayoutFrag = null;
let bindGroupLayoutVert = null;
let bindGroupFrag = null;
let bindGroupVert = null;
let updatedFrag = 0;
let updatedVert = 0;

inReset.onTriggered = () =>
{
    pipe = null;
};

inShaderFrag.onChange = () =>
{
    if (inShaderFrag.get() != oldShader)pipe = null;
    oldShader = inShaderFrag.get();
};

exec.onTriggered = () =>
{
    if (!inShaderFrag.get() || !inShaderVert.get()) return;
    if (!inShaderFrag.get().shader || !inShaderVert.get().shader) return;
    if (updatedVert != inShaderVert.get().updated)pipe = null;
    if (updatedFrag != inShaderFrag.get().updated)pipe = null;

    const mgpu = op.patch.frameStore.mgpu;

    if (!pipe)
    {
        console.log("create renderpipe");
        const bindsFrag = inShaderFrag.get().bindings.array();
        const bindsVert = inShaderVert.get().bindings.array();

        bindGroupLayoutFrag = MGPU.createBindGroupLayout(mgpu, bindsFrag);
        bindGroupLayoutVert = MGPU.createBindGroupLayout(mgpu, bindsVert);

        updatedVert = inShaderVert.get().updated;
        updatedFrag = inShaderFrag.get().updated;

        const o = {

            "layout": mgpu.device.createPipelineLayout({
                "bindGroupLayouts": [bindGroupLayoutVert, bindGroupLayoutFrag],
            }),
            "vertex": inShaderVert.get().shader.vertex,
            "fragment": inShaderFrag.get().shader.fragment,
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
        bindGroupFrag = MGPU.createBindGroup(mgpu, bindsFrag, bindGroupLayoutFrag);
        bindGroupVert = MGPU.createBindGroup(mgpu, bindsVert, bindGroupLayoutVert);

        pipe = mgpu.device.createRenderPipeline(o);
    }

    if (!pipe) return console.log("no pipe");
    mgpu.passEncoder.setPipeline(pipe);
    mgpu.passEncoder.setBindGroup(1, bindGroupFrag);
    mgpu.passEncoder.setBindGroup(0, bindGroupVert);

    mgpu.passEncoder.draw(6, inInstances.get());

    next.trigger();
};
