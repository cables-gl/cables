const
    exec = op.inTrigger("Execute"),
    inTex = op.inTexture("RGBE Texture"),
    inAspect = op.inFloat("Aspect", 1),
    inThreshold = op.inFloatSlider("Threshold", 0.2),
    inRepeatZ = op.inInt("Repeats", 1),
    inRepeatSpace = op.inFloat("Repeats Spacing", 0.1),

    next = op.outTrigger("Next"),
    outFpTex = op.outTexture("HDR Texture");

inTex.setUiAttribs({ "title": "Texture" });

const tc = new CGL.CopyTexture(op.patch.cgl, op.objName,
    {
        "shader": attachments.rgbe2fp_frag,
        "isFloatingPointTexture": true,
        "filter": CGL.Texture.FILTER_NEAREST,

    });

let needsUpdate = true;
let height = 0;
const uni1 = new CGL.Uniform(tc.bgShader, "f", "aspect", inAspect);
const uni2 = new CGL.Uniform(tc.bgShader, "f", "threshold", inThreshold);
new CGL.Uniform(tc.bgShader, "f", "repeatsY", inRepeatZ);
new CGL.Uniform(tc.bgShader, "f", "repeatsSpace", inRepeatSpace);

inTex.onChange =
    inRepeatSpace.onChange =
    inRepeatZ.onChange =
    inThreshold.onChange =
    inAspect.onChange =
    () =>
    {
        needsUpdate = true;
    };

exec.onTriggered = () =>
{
    const tex = inTex.get();
    if (!tex) return;

    if (needsUpdate)
    {
        const repeats = Math.max(1, inRepeatZ.get());

        tc.setSize(
            tex.width,
            tex.height * repeats);

        outFpTex.setRef(tc.copy(inTex.get()));

        needsUpdate = false;
    }

    next.trigger();
};
