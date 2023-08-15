const
    exec = op.inTrigger("Execute"),
    inTex = op.inTexture("RGBE Texture"),
    inAspect = op.inFloat("Aspect", 1),
    inThreshold = op.inFloatSlider("Threshold", 0.2),
    inRepeatZ = op.inInt("Repeats", 1),
    inRepeatSpace = op.inFloat("Repeats Spacing", 0.1),

    next = op.outTrigger("Next"),
    outFpTex = op.outTexture("HDR Texture");

const tc = new CGL.CopyTexture(op.patch.cgl, "rgbe2hdr",
    {
        "shader": attachments.rgbe2fp_frag,
        "isFloatingPointTexture": true,
        "filter": CGL.Texture.FILTER_NEAREST,

    });

let height = 0;
const uni1 = new CGL.Uniform(tc.bgShader, "f", "aspect", inAspect);
const uni2 = new CGL.Uniform(tc.bgShader, "f", "threshold", inThreshold);
new CGL.Uniform(tc.bgShader, "f", "repeatsY", inRepeatZ);
new CGL.Uniform(tc.bgShader, "f", "repeatsSpace", inRepeatSpace);

exec.onTriggered = () =>
{
    if (!inTex.get()) return;

    const repeats = Math.max(1, inRepeatZ.get());

    const nheight = inTex.get().height * repeats;
    if (height != nheight)
    {
        height = nheight;
        tc.setSize(
            inTex.get().width,
            inTex.get().height * repeats);
    }

    outFpTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));
    outFpTex.set(tc.copy(inTex.get()));

    next.trigger();
};
