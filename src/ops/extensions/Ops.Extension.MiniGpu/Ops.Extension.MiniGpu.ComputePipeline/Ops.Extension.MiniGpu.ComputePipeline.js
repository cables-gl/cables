const
    exec = op.inTrigger("Trigger"),
    inShader = op.inObject("Shader"),
    next = op.outTrigger("Next");

let pipe = null;
let commandEncoder;
let oldShader = null;

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
    if (!mgpu || !inShader.get() || !inShader.get().compute) return;
    if (!pipe)
    {
        commandEncoder = mgpu.device.createCommandEncoder();
        const o = {
            "layout": "auto",
            "compute": inShader.get().compute,
        };

        pipe = op.patch.frameStore.mgpu.device.createComputePipeline(o);
        console.log("compute created...");
    }

    if (!pipe) return console.log("no pipe");

    const pass = commandEncoder.beginComputePass();

    pass.setPipeline(pipe);

    const workgroupSize = 64;
    const numWorkgroups = Math.ceil(1000 / workgroupSize);
    pass.dispatchWorkgroups(numWorkgroups);
    pass.end();

    next.trigger();

};
