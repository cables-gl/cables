const
    exec = op.inTrigger("Trigger"),
    tex = op.inObject("texture"),
    inName = op.inString("name"),
    next = op.outTrigger("Next");

let bindingTex = null;
let bindingSampler = null;

tex.onChange =
    exec.onLinkChange = () =>
    {
        bindingTex = null;
        bindingSampler = null;
    };

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    const texture = tex.get() || MGPU.getEmptyTexture(mgpu);
    if (!bindingTex)
    {

        /* minimalcore:start */
        op.setUiAttrib({ "extendTitle": inName.get() });

        /* minimalcore:end */

        const layout = {
            "visibility": mgpu.stage,
            "texture":
            {
                "sampleType": "float",
                "viewDimension": "2d",
                "multisampled": false
            }
        };
        const sampler = mgpu.device.createSampler(
            {
                "magFilter": "linear",
                "minFilter": "linear",
                "addressModeU": "repeat",
                "addressModeV": "repeat"
            });

        bindingTex = {
            "header": "var " + inName.get() + " : texture_2d<f32>;",
            "resource": texture.createView(),
            "layout": layout
        };
        bindingSampler = {
            "header": "var " + inName.get() + "_sampler : sampler;",
            "layout": { "visibility": mgpu.stage, "sampler": { "type": "filtering" } },
            "resource": sampler
        };

        mgpu.rebuildShaderModule = "new uniform binding: " + inName.get();
    }

    let mvp = MGPU.mm.mul(
        op.patch.frameStore.mgpu.matProj.current(),
        op.patch.frameStore.mgpu.matModel.current()
    );
    // mvp=        op.patch.frameStore.mgpu.matModel.current();

    // console.log("text",mvp );
    // mgpu.device.queue.writeBuffer(uniformBuffer, 0, new Float32Array(mvp));

    if (bindingTex)
    {
        mgpu.bindings.push(bindingTex);
        mgpu.bindings.push(bindingSampler);
    }
    next.trigger();
};
