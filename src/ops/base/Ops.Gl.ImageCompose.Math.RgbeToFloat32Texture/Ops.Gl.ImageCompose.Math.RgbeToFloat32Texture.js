const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.rgbe2fp_frag);

// const highEdgeUniform = new CGL.Uniform(shader, "f", "highEdge", inHighEdge);

// CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

// const
//     exec = op.inTrigger("Execute"),
//     inTex = op.inTexture("RGBE Texture"),
//     next = op.outTrigger("Next"),
//     outFpTex = op.outTexture("HDR Texture"),
//     tfilter = op.inSwitch("Filter", ["nearest", "linear"], "linear"),
//     twrap = op.inValueSelect("Wrap", ["clamp to edge", "repeat", "mirrored repeat"], "repeat");

// let tc = null;

// twrap.onChange =
//     tfilter.onChange = init;
// init();

// function init()
// {
//     let wrap = CGL.Texture.WRAP_REPEAT;
//     if (twrap.get() == "mirrored repeat") wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
//     if (twrap.get() == "clamp to edge") wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

//     let filter = CGL.Texture.FILTER_NEAREST;
//     if (tfilter.get() == "linear") filter = CGL.Texture.FILTER_LINEAR;

//     if (tc)tc.dispose();
//     tc = new CGL.CopyTexture(op.patch.cgl, "rgbe2hdr",
//         {
//             "shader": attachments.rgbe2fp_frag,
//             "isFloatingPointTexture": true,
//             "filter": filter,
//             "wrap": wrap
//         });
// }

// outFpTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));

// exec.onTriggered = () =>
// {
//     if (!inTex.get()) return;

//     outFpTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));
//     outFpTex.set(tc.copy(inTex.get()));

//     next.trigger();
// };
