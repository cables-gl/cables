const
    exec = op.inTrigger("Trigger"),
    inShader = op.inObject("Shader"),
    inNum = op.inInt("Num", 64),

    next = op.outTrigger("Next");

let pipe = null;
let commandEncoder;
let oldShader = null;
let computeBindGroup = null;

inShader.onChange = () =>
{
    if (inShader.get() != oldShader)
    {
        pipe = null;
        oldShader = inShader.get();
    }
};

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!mgpu) return console.log("no mgpu");
    if (!inShader.get() || !inShader.get().shader.compute) return console.log("no shader");
    if (!pipe)
    {
        // console.log("create comp pipe");
        const s = inShader.get();
        const bindGroupLayout = MGPU.createBindGroupLayout(mgpu, s.bindings.array());

        const o = {
            // "layout": "auto",
            // "layout": bindGroupLayout,
            "layout": mgpu.device.createPipelineLayout({
                "bindGroupLayouts": [bindGroupLayout],
            }),
            "compute": s.shader.compute,
        };

        /// ////////////////////

        pipe = mgpu.device.createComputePipeline(o);

        /// ///////////////////////////////////
        computeBindGroup = MGPU.createBindGroup(mgpu, s.bindings.array(), bindGroupLayout);
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

    next.trigger();
};
