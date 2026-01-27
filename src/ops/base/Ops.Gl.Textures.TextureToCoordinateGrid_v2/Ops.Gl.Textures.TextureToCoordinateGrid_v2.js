const
    exec = op.inTrigger("Execute"),
    inTex = op.inTexture("RGBE Texture"),
    inAspect = op.inFloat("Aspect", 1),
    inScale = op.inFloat("Scale", 1),
    inThreshold = op.inFloatSlider("Threshold", 0.2),
    inPixelFormat = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA16F),

    inRepeatZ = op.inInt("Repeats", 1),
    inRepeatSpace = op.inFloat("Repeats Spacing", 0.1),

    next = op.outTrigger("Next"),
    outFpTex = op.outTexture("HDR Texture");

inTex.setUiAttribs({ "title": "Texture" });
let tc = null;
inPixelFormat.onChange = updateCopy;

let needsUpdate = true;
let height = 0;
let uni1, uni2, uni3, uni4, uni5;

updateCopy();

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
function updateCopy()
{
    tc = new CGL.CopyTexture(op.patch.cgl, op.objName,
        {
            "shader": attachments.rgbe2fp_frag,
            "isFloatingPointTexture": true,
            "pixelFormat": inPixelFormat.get(),
            "filter": CGL.Texture.FILTER_NEAREST
        });

    needsUpdate = true;

    uni1 = new CGL.Uniform(tc.bgShader, "f", "aspect", inAspect);
    uni2 = new CGL.Uniform(tc.bgShader, "f", "threshold", inThreshold);
    uni3 = new CGL.Uniform(tc.bgShader, "f", "repeatsY", inRepeatZ);
    uni4 = new CGL.Uniform(tc.bgShader, "f", "repeatsSpace", inRepeatSpace);
    uni5 = new CGL.Uniform(tc.bgShader, "f", "scale", inScale);
}
