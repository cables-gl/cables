const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next");

let binding = null;
let uniformBuffer;
const uniformArray = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

exec.onLinkChange = () =>
{
    binding = null;
};

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    if (!binding)
    {

        /* minimalcore:start */
        // op.setUiAttrib({ "extendTitle": inName.get() });

        /* minimalcore:end */

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
            "headSrc": "struct Cables{mvp:mat4x4<f32>,resScreen:vec2f,time:f32,timeDelta:f32}\n",
            "layout": layout
        };

        mgpu.rebuildShaderModule = "new uniform binding: default uniforms";
    }

    let mvp = MGPU.mm.mul(
        op.patch.frameStore.mgpu.matProj.current(),
        op.patch.frameStore.mgpu.matModel.current()
    );
    uniformArray.set(mvp, 0);
    uniformArray[16] = mgpu.width;
    uniformArray[17] = mgpu.height;

    mgpu.device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

    mgpu.bindings.push(binding);

    next.trigger();
};
