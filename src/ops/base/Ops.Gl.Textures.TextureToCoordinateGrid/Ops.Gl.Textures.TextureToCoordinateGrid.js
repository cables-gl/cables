const
    exec = op.inTrigger("Execute"),
    inTex = op.inTexture("RGBE Texture"),
    inAspect = op.inFloat("Aspect", 1),
    inThreshold = op.inFloatSlider("Threshold", 0.2),
    next = op.outTrigger("Next"),
    outFpTex = op.outTexture("HDR Texture");

const tc = new CGL.CopyTexture(op.patch.cgl, "rgbe2hdr",
    {
        "shader": attachments.rgbe2fp_frag,
        "isFloatingPointTexture": true,
        "filter": CGL.Texture.FILTER_NEAREST
    });

const uni1 = new CGL.Uniform(tc.bgShader, "f", "aspect", inAspect);
const uni2 = new CGL.Uniform(tc.bgShader, "f", "threshold", inThreshold);

exec.onTriggered = () =>
{
    if (!inTex.get()) return;

    outFpTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));
    outFpTex.set(tc.copy(inTex.get()));

    next.trigger();
};
