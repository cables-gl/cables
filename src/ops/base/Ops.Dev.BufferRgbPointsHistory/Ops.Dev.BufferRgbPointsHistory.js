const
    exec = op.inTrigger("Execute"),
    inTex0 = op.inTexture("Position Texture"),
    inTex1 = op.inTexture("Pass Through 1"),
    inWidth = op.inInt("Num Frames", 200),
    inLines = op.inInt("Num Lines", 100),
    inSeed = op.inFloat("Seed", 0),
    next = op.outTrigger("Next"),
    outFpTex = op.outTexture("Spline Rows Texture"),
    outPass1 = op.outTexture("Result Pass Through 1");

const cgl = op.patch.cgl;
let pixelPos = 0;
let width = 200;
let numLines = 100;
let texRandoms = null;
let feedback0 = null;
let feedback1 = null;
let randomCoords = null;
let needsSetSize = true;

const tc = new CGL.CopyTexture(op.patch.cgl, "bufferrgbpoints",
    {
        "shader": attachments.buffer_frag,
        "isFloatingPointTexture": true,
        "numRenderBuffers": 2,
    });

const feedback = new CGL.CopyTexture(op.patch.cgl, "rgbpointsfeedback",
    {
        "isFloatingPointTexture": true,
        "numRenderBuffers": 2,
    });

<<<<<<< HEAD
=======
const cgl = op.patch.cgl;
let pixelPos = 0;
let width = 200;
let numLines = 100;
let texRandoms = null;
let last = null;
let randomCoords = null;
let needsSetSize = true;
let firstTime = true;

>>>>>>> 1ed3855bb15c02520ecbf566200f56de0f7d663f
const
    uniColumn = new CGL.Uniform(tc.bgShader, "f", "column", 0),
    uniWidth = new CGL.Uniform(tc.bgShader, "f", "width", 0),

    uniRandoms = new CGL.Uniform(tc.bgShader, "t", "texRandoms", 1),

    uniTex0 = new CGL.Uniform(tc.bgShader, "t", "texInput0", 2),
    uniTexFb0 = new CGL.Uniform(tc.bgShader, "t", "texFeedback0", 3),

    uniTex1 = new CGL.Uniform(tc.bgShader, "t", "texInput1", 4),
    uniTexFb1 = new CGL.Uniform(tc.bgShader, "t", "texFeedback1", 5);

inWidth.onChange =
inLines.onChange = () => { needsSetSize = true; };

function setSize()
{
    numLines = Math.max(1, inLines.get());
    width = Math.max(1, inWidth.get());

    texRandoms = new CGL.Texture(cgl, { "isFloatingPointTexture": true, "name": "noisetexture" });
    last = new CGL.Texture(cgl, { "width": width, "height": numLines });

    randomCoords = new Float32Array(numLines * 4);
    genRandomTex();

<<<<<<< HEAD
    feedback0 = CGL.Texture.getEmptyTextureFloat(cgl);
    feedback1 = CGL.Texture.getEmptyTextureFloat(cgl);

    tc.setSize(width, numLines);
    feedback.setSize(width, numLines);
=======
    tc.copy(CGL.Texture.getEmptyTextureFloat(cgl), CGL.Texture.getEmptyTextureFloat(cgl));
    feedback.copy(CGL.Texture.getEmptyTextureFloat(cgl), CGL.Texture.getEmptyTextureFloat(cgl));
>>>>>>> 1ed3855bb15c02520ecbf566200f56de0f7d663f

    needsSetSize = false;
}

function genRandomTex()
{
    Math.randomSeed = inSeed.get();
    for (let i = 0; i < numLines; i++)
    {
        randomCoords[i * 4] = Math.seededRandom();
        randomCoords[i * 4 + 1] = Math.seededRandom();
        randomCoords[i * 4 + 2] = 0;
        randomCoords[i * 4 + 3] = 1;
    }

    texRandoms.initFromData(randomCoords, 1, numLines, CGL.Texture.FILTER_NEAREST, CGL.Texture.WRAP_REPEAT);
}

exec.onTriggered = () =>
{
    if (needsSetSize)setSize();
    pixelPos++;
    pixelPos %= width;

    if (!inTex0.get()) return;

    uniColumn.set(pixelPos);
    uniWidth.set(width);

    const shader = tc.bgShader;

    if (texRandoms.tex) shader.pushTexture(uniRandoms, texRandoms.tex);

<<<<<<< HEAD
    shader.pushTexture(uniTex0, inTex0.get().tex);
    if (feedback0.tex) shader.pushTexture(uniTexFb0, feedback0.tex);
    else shader.pushTexture(uniTexFb0, CGL.Texture.getEmptyTextureFloat(cgl).tex);
=======
    shader.pushTexture(uniTex0, inTex0.get() || CGL.Texture.getEmptyTextureFloat(cgl));
    if (last.tex) shader.pushTexture(uniTexFb0, last);
    else shader.pushTexture(uniTexFb0, CGL.Texture.getEmptyTextureFloat(cgl));
>>>>>>> 1ed3855bb15c02520ecbf566200f56de0f7d663f

    if (inTex1.isLinked() && inTex1.get())
    {
        shader.pushTexture(uniTex1, inTex1.get() || CGL.Texture.getEmptyTextureFloat(cgl));
        if (feedback.fb) shader.pushTexture(uniTexFb1, feedback.fb.getTextureColorNum(1));
        else shader.pushTexture(uniTexFb1, CGL.Texture.getEmptyTextureFloat(cgl));
    }
    else
    {
        shader.pushTexture(uniTex1, CGL.Texture.getEmptyTextureFloat(cgl));
        shader.pushTexture(uniTexFb1, CGL.Texture.getEmptyTextureFloat(cgl));
    }

    const newTex = tc.copy(feedback0);

    tc.bgShader.popTextures();

    feedback.copy(newTex, tc.fb.getTextureColorNum(1));
    feedback0 = feedback.fb.getTextureColorNum(0);
    feedback1 = feedback.fb.getTextureColorNum(1);

<<<<<<< HEAD
    outFpTex.setRef(feedback0);
    outPass1.setRef(feedback1);
=======
    outFpTex.setRef(feedback.fb.getTextureColorNum(0));
    outPass1.setRef(feedback.fb.getTextureColorNum(1));
>>>>>>> 1ed3855bb15c02520ecbf566200f56de0f7d663f

    next.trigger();
};

//
