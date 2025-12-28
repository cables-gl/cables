const
    exec = op.inTrigger("Trigger"),
    inShader = op.inObject("Shader"),
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
        console.log("create comp pipe");
        const s = inShader.get();
        const o = {
            "layout": "auto",
            "compute": s.shader.compute,
        };

        pipe = mgpu.device.createComputePipeline(o);

        const bg = {
            "layout": pipe.getBindGroupLayout(0),
            "entries": []
        };

        for (let i = 0; i < s.bindings.array().length; i++)
        {
            console.log("resourceeeeeeeeee", s.bindings.array()[i].resource);
            bg.entries.push(
                {
                    "binding": i,
                    "resource": s.bindings.array()[i].resource
                    // "resource": { "buffer": s.bindings[i] },
                },
            );
        }
        console.log("ginnnnnnnnnnnnnnnnn", bg);
        computeBindGroup = mgpu.device.createBindGroup(bg);

        console.log("compute created...");
    }

    if (!pipe) return console.log("no pipe");
    commandEncoder = mgpu.device.createCommandEncoder();

    const pass = commandEncoder.beginComputePass();

    pass.setPipeline(pipe);

    pass.setBindGroup(0, computeBindGroup);
    const workgroupSize = 64;
    const numWorkgroups = Math.ceil(workgroupSize);
    pass.dispatchWorkgroups(numWorkgroups);
    pass.end();
    const gpuCommands = commandEncoder.finish();
    mgpu.device.queue.submit([gpuCommands]);

    next.trigger();
};
