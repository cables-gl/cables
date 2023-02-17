const
    exec = op.inTrigger("Execute"),
    inTex = op.inTexture("RGBE Texture"),
    inAspect = op.inFloat("Aspect", 1),
    inThreshold = op.inFloatSlider("Threshold", 0.2),
    next = op.outTrigger("Next"),
    outFpTex = op.outTexture("HDR Texture");

const tc = new CGL.CopyTexture(op.patch.cgl, "bufferrgbpoints",
    {
        "shader": attachments.buffer_frag,
        "isFloatingPointTexture": true
    });

const feedback = new CGL.CopyTexture(op.patch.cgl, "rgbpointsfeedback",
    {
        "isFloatingPointTexture": true
    });

const
    uniColumn = new CGL.Uniform(tc.bgShader, "f", "column", 0),
    uniWidth = new CGL.Uniform(tc.bgShader, "f", "width", 0),
    uniCoords = new CGL.Uniform(tc.bgShader, "t", "texCoords", 1),
    uniOldTex = new CGL.Uniform(tc.bgShader, "t", "texOld", 2),
    uni1 = new CGL.Uniform(tc.bgShader, "f", "aspect", inAspect),
    uni2 = new CGL.Uniform(tc.bgShader, "f", "threshold", inThreshold);

let pixel = 0;
let width = 200;
let numLines = 100;

const cgl = op.patch.cgl;

let tex = new CGL.Texture(cgl, { "width": width, "height": numLines });
let last = new CGL.Texture(cgl, { "width": width, "height": numLines });

exec.onTriggered = () =>
{
    pixel++;
    pixel %= width;

    if (!inTex.get()) return;

    uniColumn.set(pixel);
    uniWidth.set(width);

    if (last)
    {
    }

    tc.bgShader.pushTexture(uniCoords, inTex.get().tex);
    if (last) tc.bgShader.pushTexture(uniOldTex, last.tex);

    const newTex = tc.copy(last);

    tc.bgShader.popTextures();

    last = feedback.copy(newTex);

    outFpTex.setRef(newTex);
    next.trigger();
};
