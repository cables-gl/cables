const
    exec = op.inTrigger("Execute"),
    inTex = op.inTexture("RGBE Texture"),
    inWidth = op.inInt("Num Frames", 200),
    inLines = op.inInt("Num Lines", 100),
    inSeed = op.inFloat("Seed", 0),
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

const cgl = op.patch.cgl;
let pixelPos = 0;
let width = 200;
let numLines = 100;
let texRandoms = null;
let last = null;
let randomCoords = null;
let needsSetSize = true;

const
    uniColumn = new CGL.Uniform(tc.bgShader, "f", "column", 0),
    uniWidth = new CGL.Uniform(tc.bgShader, "f", "width", 0),
    uniCoords = new CGL.Uniform(tc.bgShader, "t", "texCoords", 1),
    uniRandoms = new CGL.Uniform(tc.bgShader, "t", "texRandoms", 2),
    uniOldTex = new CGL.Uniform(tc.bgShader, "t", "texOld", 3);

inWidth.onChange =
inLines.onChange = () => { needsSetSize = true; };

function setSize()
{
    numLines = Math.max(1, inLines.get());
    width = Math.max(1, inWidth.get());

    // if (last)last.delete();
    last = new CGL.Texture(cgl, { "width": width, "height": numLines });

    // if (texRandoms)texRandoms.delete();
    texRandoms = new CGL.Texture(cgl, { "isFloatingPointTexture": true, "name": "noisetexture" });

    randomCoords = new Float32Array(numLines * 4);
    genRandomTex();
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

    if (!inTex.get()) return;

    uniColumn.set(pixelPos);
    uniWidth.set(width);

    tc.bgShader.pushTexture(uniCoords, inTex.get().tex);
    if (last.tex) tc.bgShader.pushTexture(uniOldTex, last.tex);
    if (texRandoms.tex) tc.bgShader.pushTexture(uniRandoms, texRandoms.tex);

    const newTex = tc.copy(last);

    tc.bgShader.popTextures();

    last = feedback.copy(newTex);

    outFpTex.setRef(newTex);
    next.trigger();
};

//
