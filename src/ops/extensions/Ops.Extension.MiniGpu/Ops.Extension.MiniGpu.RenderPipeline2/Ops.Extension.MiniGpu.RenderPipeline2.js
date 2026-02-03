const
    exec = op.inTrigger("Trigger"),
    // inShaderFrag = op.inObject("Frag"),
    // inShaderVert = op.inObject("Vert"),
    inInstances = op.inInt("Instances", 100),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Childs");

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

// inShaderFrag.onChange = () =>
// {
//     if (inShaderFrag.get() != oldShader)pipe = null;
//     oldShader = inShaderFrag.get();
// };

exec.onTriggered = () =>
{
    // if (!inShaderFrag.get() || !inShaderVert.get()) return;
    // if (!mgpu.shaderModules.fragment.shader || !mgpu.shaderModules.vertex.shader) return;
    // if (updatedVert != mgpu.shaderModules.vertex.updated)pipe = null;
    // if (updatedFrag != mgpu.shaderModules.fragment.updated)pipe = null;

    const mgpu = op.patch.frameStore.mgpu;
    mgpu.shaderModules = {};

    next.trigger();
    // if (!mgpu.shaderModules.fragment || !mgpu.shaderModules.vertex) return;

    if (!pipe || mgpu.rebuildPipeline)
    {
        console.log("create renderpipe", mgpu.rebuildPipeline);
        const bindsFrag = mgpu.shaderModules.fragment.bindings.array();
        const bindsVert = mgpu.shaderModules.vertex.bindings.array();

        bindGroupLayoutFrag = MGPU.createBindGroupLayout(mgpu, bindsFrag);
        bindGroupLayoutVert = MGPU.createBindGroupLayout(mgpu, bindsVert);

        updatedVert = mgpu.shaderModules.vertex.updated;
        updatedFrag = mgpu.shaderModules.fragment.updated;

        const o = {

            "layout": mgpu.device.createPipelineLayout({
                "bindGroupLayouts": [bindGroupLayoutVert, bindGroupLayoutFrag],
            }),
            "vertex": mgpu.shaderModules.vertex.shader.vertex,
            "fragment": mgpu.shaderModules.fragment.shader.fragment,
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
};
