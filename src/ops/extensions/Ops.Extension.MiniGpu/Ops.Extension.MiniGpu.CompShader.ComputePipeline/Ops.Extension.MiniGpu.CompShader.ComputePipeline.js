const exec = op.inTrigger("Trigger"),
    inWg = op.inSwitch("Workgroups", ["1", "2", "3"], "1"),
    inNum = op.inInt("Workgroup Num X", 64),
    inNum2 = op.inInt("Workgroup Num Y", 64),
    inNum3 = op.inInt("Workgroup Num Z", 64),

    inWgSize = op.inInt("Workgroup Size", 64),
    inOverrides = op.inObject("Overrides"),
    childx = op.outTrigger("childx");

let pipe = null;
let commandEncoder;
let oldShader = null;
let computeBindGroup = null;

/* minimalcore:start */
function updateUi()
{
    inNum2.setUiAttribs({ "greyout": parseInt(inWg.get()) < 2 });
    inNum3.setUiAttribs({ "greyout": parseInt(inWg.get()) < 3 });
}

inWg.onChange = updateUi;
updateUi();

/* minimalcore:end */
inOverrides.onChange = () =>
{
    pipe = null;
};

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!mgpu) return console.log("no mgpu");

    mgpu.shaderModules = {};
    childx.trigger();
    if (!mgpu.shaderModules.compute) return;
    if (!pipe || mgpu.rebuildPipeline)
    {
        mgpu.shaderModules.compute.objectStructure.constants = inOverrides.get() || {};

        const bindGroupLayout = MGPU.createBindGroupLayout(mgpu, mgpu.shaderModules.compute.bindings);
        const o = {
            "layout": mgpu.device.createPipelineLayout(
                {
                    "bindGroupLayouts": [bindGroupLayout]
                }),
            "compute": mgpu.shaderModules.compute.objectStructure
        };

        /* minimalcore:start */
        o.label = op.uiAttribs.comment || op.id;

        /* minimalcore:end */

        pipe = mgpu.device.createComputePipeline(o);

        computeBindGroup = MGPU.createBindGroup(mgpu, mgpu.shaderModules.compute.bindings, bindGroupLayout);
    }

    if (!pipe) return console.log("no pipe");
    commandEncoder = mgpu.device.createCommandEncoder();

    const pass = commandEncoder.beginComputePass();

    pass.setPipeline(pipe);

    pass.setBindGroup(0, computeBindGroup);
    const workgroupSize = inWgSize.get();

    if (inWg.get() == "1") pass.dispatchWorkgroups(Math.ceil(inNum.get() / workgroupSize));
    if (inWg.get() == "2") pass.dispatchWorkgroups(Math.ceil(inNum.get() / workgroupSize), Math.ceil(inNum2.get() / workgroupSize));
    if (inWg.get() == "3") pass.dispatchWorkgroups(Math.ceil(inNum.get() / workgroupSize), Math.ceil(inNum2.get() / workgroupSize), Math.ceil(inNum3.get() / workgroupSize));

    pass.end();
    const gpuCommands = commandEncoder.finish();
    mgpu.device.queue.submit([gpuCommands]);
};
