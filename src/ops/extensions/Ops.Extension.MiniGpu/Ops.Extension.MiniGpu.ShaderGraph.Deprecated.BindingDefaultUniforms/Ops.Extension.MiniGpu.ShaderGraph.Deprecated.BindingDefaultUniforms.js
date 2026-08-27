const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next");

const uniformArray = new Float32Array([
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0
]);
let binding = null;
let uniformBuffer;
let time = 0;

op.onAnimFrame = function (t) { time = t; };

exec.onLinkChange = () =>
{
    binding = null;
};

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!binding)
    {
        const layout = {
            "visibility": mgpu.stage,
            "buffer":
            {
                "type": "uniform"
            }
        };
        uniformBuffer = mgpu.device.createBuffer(
            {
                "size": uniformArray.byteLength,
                "usage": GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });

        binding = {
            "header": "var<uniform> cables : Cables;",
            "resource": { "buffer": uniformBuffer },
            "headSrc": attachments.head_wgsl,
            "layout": layout
        };

        mgpu.rebuildShaderModule = "new uniform binding: default uniforms";
    }

    let mvp = MGPU.mm.mul(
        op.patch.frameStore.mgpu.matProj.current(),
        op.patch.frameStore.mgpu.matModel.current()
    );
    uniformArray.set(mvp, 0);
    uniformArray.set(op.patch.frameStore.mgpu.matProj.current(), 16);
    uniformArray.set(MGPU.mm.identity(), 32);
    uniformArray.set(op.patch.frameStore.mgpu.matModel.current(), 48);
    uniformArray[64] = mgpu.canvas.width;
    uniformArray[65] = mgpu.canvas.height;
    uniformArray[66] = time;
    uniformArray[67] = mgpu.timeDelta;

    // console.log("uniformarray", mgpu.timeDelta);
    mgpu.device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

    mgpu.bindings.push(binding);

    next.trigger();
};
