const
    exec = op.inTrigger("Trigger"),
    inVerts = op.inInt("Vertices", 6),
    inInstances = op.inInt("Instances", 1),
    topology = op.inSwitch("topology", ["triangle-list", "point-list", "line-list", "line-strip"], "triangle-list"),
    cull = op.inSwitch("cull", ["none", "back", "front"], "none"),
    depthWriteEnabled = op.inBool("depthWriteEnabled", true),
    depthCompare = op.inSwitch("depthCompare", ["less-equal", "always"], "less-equal"),
    inModuleFragment = op.inObject("Fragment Module", null, "shadermodule"),
    inModuleVertex = op.inObject("Vertex Module", null, "shadermodule"),
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
let pipeError = false;

inModuleFragment.onChange =
    inModuleVertex.onChange =
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

    let moduleFrag = inModuleFragment.get();
    let moduleVertex = inModuleVertex.get();
    if (inModuleFragment.isLinked()) inModuleFragment.links[0].getOtherPort(inModuleFragment).op.updateShaderModule(mgpu);
    if (inModuleVertex.isLinked()) inModuleVertex.links[0].getOtherPort(inModuleVertex).op.updateShaderModule(mgpu);

    if (!pipe || mgpu.rebuildPipeline)
    {
        mgpu.rebuildPipeline = false;

        /* minimalcore:start */

        op.setUiError("nofrag", inModuleFragment.get() ? null : "no fragment module...");
        op.setUiError("novert", inModuleVertex.get() ? null : "no vertex module...");
        if (!moduleFrag) return;
        if (!moduleVertex) return;

        /* minimalcore:end */

        const bindsFrag = moduleFrag.bindings;
        const bindsVert = moduleVertex.bindings;

        bindGroupLayoutFrag = MGPU.createBindGroupLayout(mgpu, bindsFrag);
        bindGroupLayoutVert = MGPU.createBindGroupLayout(mgpu, bindsVert);

        updatedVert = moduleVertex.updated;
        updatedFrag = moduleFrag.updated;

        const o = {
            "label": op.id,
            "layout": mgpu.device.createPipelineLayout(
                {
                    "bindGroupLayouts": [bindGroupLayoutVert, bindGroupLayoutFrag]
                }),
            "vertex": moduleVertex.getObjectStructure(),
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

        pipeError = false;

        /* minimalcore:start */
        op.setUiError("pipeerror", null);
        mgpu.device.pushErrorScope("validation");
        // const pipeline = mgpu.device.createRenderPipeline(descriptor);

        /* minimalcore:end */
        pipe = mgpu.device.createRenderPipeline(o);

        /* minimalcore:start */
        mgpu.device.popErrorScope().then((error) =>
        {
            if (error)
            {
                pipeError = true;
                console.error(error.message);
                console.error(o);
                op.setUiError("pipeerror", error.message.replaceAll("\n", "<br/>"));
            }
        });

        /* minimalcore:end */
        /* minimalcore:start */

        op.setUiError("errfrag", moduleFrag.hasError ? "fragment module error" : null);
        op.setUiError("errvert", moduleVertex.hasError ? "vertex module error" : null);

        /* minimalcore:end */

    }

    if (!moduleFrag || !moduleVertex || moduleFrag.hasError || moduleVertex.hasError) return;

    if (!pipe) return console.log("no pipe");
    if (pipeError) return;
    mgpu.target.current().passEncoder.setPipeline(pipe);
    mgpu.target.current().passEncoder.setBindGroup(1, bindGroupFrag);
    mgpu.target.current().passEncoder.setBindGroup(0, bindGroupVert);

    mgpu.target.current().passEncoder.draw(inVerts.get(), inInstances.get());
};
