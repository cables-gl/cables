const
    exec = op.inTrigger("Trigger"),
    inVerts = op.inInt("Vertices", 6),
    inInstances = op.inInt("Instances", 1),
    topology = op.inSwitch("topology", ["triangle-list", "point-list", "line-list", "line-strip"], "triangle-list"),
    cull = op.inSwitch("cull", ["none", "back", "front"], "none"),
    depthWriteEnabled = op.inBool("depthWriteEnabled", true),
    depthCompare = op.inSwitch("depthCompare", ["less-equal", "always"], "less-equal"),
    inModuleFragment = op.inObject("Fragment Module", null, "shadermodule"),
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

depthCompare.onChange =
    depthWriteEnabled.onChange =
    cull.onChange =
    topology.onChange =
    inReset.onTriggered = () =>
    {
        pipe = null;
    };

exec.onTriggered = () =>
{

    const mgpu = op.patch.frameStore.mgpu;
    mgpu.shaderModules = {};

    next.trigger();
    // if (!moduleFrag || !mgpu.shaderModules.vertex) return;

    if (!mgpu.target.current()) return; // console.log("nono", op.id);

    if (!pipe || mgpu.rebuildPipeline)
    {
        mgpu.rebuildPipeline = false;

        let moduleFrag = inModuleFragment.get();
        if (inModuleFragment.isLinked()) inModuleFragment.links[0].getOtherPort(inModuleFragment).op.updateShaderModule(mgpu);

        /* minimalcore:start */

        op.setUiError("nofrag", inModuleFragment.get() ? null : "no fragment module...");
        if (!moduleFrag) return;

        /* minimalcore:end */

        const bindsFrag = moduleFrag.bindings;
        const bindsVert = mgpu.shaderModules.vertex.bindings;

        bindGroupLayoutFrag = MGPU.createBindGroupLayout(mgpu, bindsFrag);
        bindGroupLayoutVert = MGPU.createBindGroupLayout(mgpu, bindsVert);

        updatedVert = mgpu.shaderModules.vertex.updated;
        updatedFrag = moduleFrag.updated;

        const o = {

            "layout": mgpu.device.createPipelineLayout(
                {
                    "bindGroupLayouts": [bindGroupLayoutVert, bindGroupLayoutFrag]
                }),
            "vertex": mgpu.shaderModules.vertex.getObjectStructure(),
            "fragment": moduleFrag.getObjectStructure(),
            "primitive":
            {
                "topology": topology.get(),
                "cullMode": cull.get()
            },
            "depthStencil":
            {
                "depthWriteEnabled": depthWriteEnabled.get(),
                "depthCompare": depthCompare.get(),
                "format": "depth24plus"
            }
        };
        if (mgpu.target.current().options.sampleCount > 1)
        {
            o.multisample = {
                "count": mgpu.target.current().options.sampleCount,
                "alphaToCoverageEnabled": true
            };
        }
        bindGroupFrag = MGPU.createBindGroup(mgpu, bindsFrag, bindGroupLayoutFrag);
        bindGroupVert = MGPU.createBindGroup(mgpu, bindsVert, bindGroupLayoutVert);

        pipe = mgpu.device.createRenderPipeline(o);
    }

    if (!pipe) return console.log("no pipe");
    mgpu.target.current().passEncoder.setPipeline(pipe);
    mgpu.target.current().passEncoder.setBindGroup(1, bindGroupFrag);
    mgpu.target.current().passEncoder.setBindGroup(0, bindGroupVert);

    mgpu.target.current().passEncoder.draw(inVerts.get(), inInstances.get());
};
