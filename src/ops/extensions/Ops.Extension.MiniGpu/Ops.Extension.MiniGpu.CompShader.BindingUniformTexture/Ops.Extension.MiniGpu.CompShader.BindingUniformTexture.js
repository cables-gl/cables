const
    exec = op.inTrigger("Trigger"),
    tex = op.inObject("texture"),
    inName = op.inString("name", "tex"),
    next = op.outTrigger("Next");

let bindingTex = null;
let bindingSampler = null;

inName.onChange =
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
        op.shaderNode.resultVarName = op.shaderNode.name = inName.get();
        op.shaderNode.result.port.setRef({});
    }

    let mvp = MGPU.mm.mul(
        op.patch.frameStore.mgpu.matProj.current(),
        op.patch.frameStore.mgpu.matModel.current()
    );

    if (bindingTex)
    {
        mgpu.bindings.push(bindingTex);
        mgpu.bindings.push(bindingSampler);
    }
    next.trigger();
};

/// ////////////////

new CABLES.ShaderGraphOp(this,
    {
        "type": "existingvar",
        "name": inName.get(),
        "title": "name",
        "params": [],
        "result": { "type": "texture", "port": op.outObject("sgtexture") },
        "resultVarName": inName.get()
    });
