const
    exec = op.inTrigger("Trigger"),
    tex = op.inObject("texture"),
    inName = op.inString("name", "tex"),
    magFilter = op.inSwitch("magFilter", ["linear", "nearest"], "linear"),
    minFilter = op.inSwitch("minFilter", ["linear", "nearest"], "linear"),
    mipmapFilter = op.inSwitch("mipmapFilter", ["linear", "nearest"], "linear"),
    inRepeat = op.inSwitch("Repeat X", ["repeat", "mirror-repeat", "clamp-to-edge"], "repeat"),
    next = op.outTrigger("Next");

let bindingTex = null;
let bindingSampler = null;

minFilter.onChange =
    magFilter.onChange =
    mipmapFilter.onChange =
    inRepeat.onChange =
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
                "magFilter": magFilter.get(),
                "minFilter": minFilter.get(),
                "mipmapFilter": mipmapFilter.get(),
                "addressModeU": inRepeat.get(),
                "addressModeV": inRepeat.get()
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
