const cgl = op.patch.cgl;

const inRefresh = op.inTrigger("Refresh");
const inFFTArray = op.inArray("FFT Array");

const inMirrorActive = op.inBool("Mirror Active", false);
const inMirrorWidth = op.inFloatSlider("Mirror Width", 0.5);

const inTextureSize = op.inSwitch("Texture Size", [64, 128, 256, 512, 1024, 2048], 512);

op.setPortGroup("Texture Options", [inTextureSize]);
op.setPortGroup("Mirror Options", [inMirrorActive, inMirrorWidth]);

const outTexture = op.outTexture("Texture Out", null, "texture");
const outPosition = op.outNumber("Position");

let updateTextureSize = false;
inTextureSize.onChange = () =>
{
    updateTextureSize = true;
};

inMirrorActive.onChange = () =>
{
    inMirrorWidth.setUiAttribs({ "greyout": !inMirrorActive.get() });
};

const texFFT = new CGL.Texture(cgl,
    {
        "name": "AnalyzerTexture - FFT Texture " + op.id,
        "wrap": CGL.Texture.CLAMP_TO_EDGE,
        "filter": CGL.Texture.FILTER_LINEAR,
    });

const texDefault = new CGL.Texture(cgl,
    {
        "name": "AnalyzerTexture - Render Texture " + op.id,
        "wrap": CGL.Texture.CLAMP_TO_EDGE,
        "filter": CGL.Texture.FILTER_LINEAR,
        "width": Number(inTextureSize.get()),
        "height": Number(inTextureSize.get()),
    });

let data = [];

let line = 0;
let height = 256;

let buffer = new Uint8Array();

function updateFFT()
{
    const arr = inFFTArray.get();
    if (!arr) return;

    const width = arr.length;
    // height = width;
    if (!width) return;

    if (data.length === 0 || data.length !== width * 4)
    {
        data.length = width * 4;
        buffer = new Uint8Array(width * height * 4);
    }

    line++;

    if (line >= height) line = 0;

    outPosition.set(line / height);

    for (let i = 0; i < width; i++)
    {
        data[i * 4 + 0] = arr[i];
        data[i * 4 + 1] = arr[i];
        data[i * 4 + 2] = arr[i];
        data[i * 4 + 3] = 255;
    }

    buffer.set(data, line * width * 4);

    if (texFFT.width != width || texFFT.height != height)
    {
        texFFT.setSize(
            width, height
        );
        // effect.setSourceTexture(texFFT);
    }

    texFFT.initFromData(
        buffer,
        width, height,
        // Number(inTextureSize.get()),
        // Number(inTextureSize.get()),
        CGL.Texture.FILTER_LINEAR,
        CGL.Texture.WRAP_CLAMP_TO_EDGE
    );
}

let effect = new CGL.TextureEffect(cgl,
    {
        // "isFloatingPointTexture": true,
        "filter": CGL.Texture.FILTER_LINEAR,
        "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
        "width": Number(inTextureSize.get()),
        "height": Number(inTextureSize.get()),
    }
);

let prevViewPort = [0, 0, 0, 0];

// ------------------

const shaderDefault = new CGL.Shader(cgl, "AnalyzerTexture - defaultShader");
shaderDefault.setSource(shaderDefault.getDefaultVertexShader(), attachments.default_frag);
const texUniformDefault = new CGL.Uniform(shaderDefault, "t", "texFFT", 1);

const shaderMirror = new CGL.Shader(cgl, "AnalyzerTexture mirror");

shaderMirror.setSource(shaderMirror.getDefaultVertexShader(), attachments.mirror_frag);

const textureUniformMirror = new CGL.Uniform(shaderMirror, "t", "tex", 0);
const uniWidthMirror = new CGL.Uniform(shaderMirror, "f", "width", inMirrorWidth);

function mirrorTexture()
{
    cgl.pushShader(shaderMirror);

    effect.startEffect();
    effect.setSourceTexture(effect.getCurrentSourceTexture());

    effect.bind();

    cgl.setTexture(0, texFFT.tex);

    effect.finish();
    effect.endEffect();

    cgl.popShader();
}

inRefresh.onTriggered = () =>
{
    if (!inFFTArray.get()) return;

    updateFFT();

    if (updateTextureSize)
    {
        texDefault.setSize(
            Number(inTextureSize.get()),
            Number(inTextureSize.get()),
        );

        effect.setSourceTexture(texDefault);
        updateTextureSize = false;
    }

    if (texFFT)
    {
        cgl.pushShader(shaderDefault);
        effect.startEffect();
        effect.setSourceTexture(texDefault);
        effect.bind();

        cgl.setTexture(1, texFFT.tex);

        effect.finish();
        effect.endEffect();

        cgl.popShader();
    }

    if (inMirrorActive.get()) mirrorTexture();

    outTexture.set(null);
    outTexture.set(effect.getCurrentSourceTexture());
};
