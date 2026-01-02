const exec = op.inTrigger("Trigger"),
    inNum = op.inInt("Num", 64),

    childx = op.outTrigger("childx");

let pipe = null;
let commandEncoder;
let oldShader = null;
let computeBindGroup = null;

// inShader.onChange = () =>
// {
//     if (inShader.get() != oldShader)
//     {
//         pipe = null;
//         oldShader = inShader.get();
//     }
// };

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!mgpu) return console.log("no mgpu");

    mgpu.shaderModules = {};
    childx.trigger();
    if (!mgpu.shaderModules.compute) return;
    // if (!inShader.get() || !inShader.get().shader.compute) return console.log("no shader");
    if (!pipe || mgpu.rebuildPipeline)
    {
        console.log("create compute pipe", mgpu.rebuildPipeline);
        const bindGroupLayout = MGPU.createBindGroupLayout(mgpu, mgpu.shaderModules.compute.bindings.array());
        const o = {
            // "layout": "auto",
            // "layout": bindGroupLayout,
            "layout": mgpu.device.createPipelineLayout({
                "bindGroupLayouts": [bindGroupLayout],
            }),
            "compute": mgpu.shaderModules.compute.shader.compute,
        };

        /// ////////////////////

        pipe = mgpu.device.createComputePipeline(o);

        /// ///////////////////////////////////
        computeBindGroup = MGPU.createBindGroup(mgpu, mgpu.shaderModules.compute.bindings.array(), bindGroupLayout);
    }

    if (!pipe) return console.log("no pipe");
    commandEncoder = mgpu.device.createCommandEncoder();

    const pass = commandEncoder.beginComputePass();

    pass.setPipeline(pipe);

    pass.setBindGroup(0, computeBindGroup);
    const workgroupSize = 64;
    const numWorkgroups = Math.ceil(inNum.get() / workgroupSize);
    pass.dispatchWorkgroups(numWorkgroups);
    pass.end();
    const gpuCommands = commandEncoder.finish();
    mgpu.device.queue.submit([gpuCommands]);
};
