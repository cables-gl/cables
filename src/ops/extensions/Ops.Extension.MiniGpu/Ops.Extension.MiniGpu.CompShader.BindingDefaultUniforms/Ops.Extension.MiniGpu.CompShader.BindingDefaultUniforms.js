const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next");

const uniformArray = new Float32Array([
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0]);
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
            "headSrc": "struct Cables\n" +
                "{\n" +
                "  mvp:mat4x4<f32>,\n" +
                "  resScreen:vec2f,\n" +
                "  time:f32,\n" +
                "  timeDelta:f32\n" +
                "}\n",
            "layout": layout
        };

        mgpu.rebuildShaderModule = "new uniform binding: default uniforms";
    }

    let mvp = MGPU.mm.mul(
        op.patch.frameStore.mgpu.matProj.current(),
        op.patch.frameStore.mgpu.matModel.current()
    );
    uniformArray.set(mvp, 0);
    uniformArray[16] = mgpu.canvas.width;
    uniformArray[17] = mgpu.canvas.height;
    uniformArray[18] = time;
    uniformArray[19] = mgpu.timeDelta;

    // console.log("uniformarray", mgpu.timeDelta);
    mgpu.device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

    mgpu.bindings.push(binding);

    next.trigger();
};
