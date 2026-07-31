const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", ""),
    next = op.outTrigger("Next");

let binding = null;
let uniformBuffer;
const uniformArray = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

inName.onChange =
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
        op.setUiAttrib({ "extendTitle": inName.get() });

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
            "header": "var<uniform> " + inName.get() + " : mat4x4<f32>;",
            "resource": { "buffer": uniformBuffer },
            "layout": layout
        };

        mgpu.rebuildShaderModule = "new uniform binding: " + inName.get();
    }

    let mvp = MGPU.mm.mul(
        op.patch.frameStore.mgpu.matProj.current(),
        op.patch.frameStore.mgpu.matModel.current()
    );
    // mvp=        op.patch.frameStore.mgpu.matModel.current();

    // console.log("text",mvp );
    mgpu.device.queue.writeBuffer(uniformBuffer, 0, new Float32Array(mvp));

    mgpu.bindings.push(binding);

    next.trigger();
};
