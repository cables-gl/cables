const
    render = op.inTrigger("render"),
    mode = op.inSwitch("Mode", ["Segments", "Iterative"], "Segments"),
    structure = op.inSwitch("Structure", ["Rows", "Columns"], "Rows"),
    invert = op.inBool("Invert", false),
    sort = op.inSwitch("Sort", ["Luminance", "R", "G", "B"], "Luminance"),
    maxLength = op.inInt("Max Length", 64),
    thresholdLow = op.inFloatSlider("Threshold Low", 0.25),
    thresholdHigh = op.inFloatSlider("Threshold High", 1),
    stagger = op.inBool("Stagger Lines", true),
    iterations = op.inInt("Iterations", 4),
    keepSorting = op.inBool("Keep Sorting", true),
    inputAmount = op.inFloatSlider("Input Amount", 0.05),
    reset = op.inTriggerButton("Reset"),
    textureMask = op.inTexture("Mask"),
    textureGroup = op.inTexture("Group"),

    trigger = op.outTrigger("trigger");

op.setPortGroup("Segments", [maxLength, thresholdLow, thresholdHigh, stagger]);
op.setPortGroup("Iterative", [iterations, keepSorting, inputAmount, reset]);

const cgl = op.patch.cgl;

const shader = new CGL.Shader(cgl, op.name + " iterative", op);
shader.setSource(shader.getDefaultVertexShader(), attachments.scroll_frag);
const
    uniTex = new CGL.Uniform(shader, "t", "tex", 0),
    uniParity = new CGL.Uniform(shader, "f", "parity", 0),
    uniTexMask = new CGL.Uniform(shader, "t", "texMask", 1),
    uniTexGroup = new CGL.Uniform(shader, "t", "texGroup", 2),
    uniTexInput = new CGL.Uniform(shader, "t", "texInput", 3),
    uniInputAmount = new CGL.Uniform(shader, "f", "inputAmount", 0);

const rankShader = new CGL.Shader(cgl, op.name + " rank", op);
rankShader.setSource(attachments.copy_vert, attachments.segments_frag);
rankShader.toggleDefine("RANK_PASS", true);
addSegmentUniforms(rankShader);

const segmentShader = new CGL.Shader(cgl, op.name + " segments", op);
segmentShader.setSource(segmentShader.getDefaultVertexShader(), attachments.segments_frag);
addSegmentUniforms(segmentShader);
const uniTexRank = new CGL.Uniform(segmentShader, "t", "texRank", 4);

const copyShader = new CGL.Shader(cgl, op.name + " copy", op);
copyShader.setSource(attachments.copy_vert, attachments.copy_frag);
const uniCopyTex = new CGL.Uniform(copyShader, "t", "tex", 0);
const copyMesh = CGL.MESHES.getSimpleRect(cgl, op.name + " copy");

const maskMixShader = new CGL.Shader(cgl, op.name + " mask mix", op);
maskMixShader.setSource(maskMixShader.getDefaultVertexShader(), attachments.maskmix_frag);
const
    uniMaskMixTex = new CGL.Uniform(maskMixShader, "t", "tex", 0),
    uniMaskMixMask = new CGL.Uniform(maskMixShader, "t", "texMask", 1),
    uniMaskMixOriginal = new CGL.Uniform(maskMixShader, "t", "texOriginal", 3);

const allShaders = [shader, rankShader, segmentShader];

let parity = 0;
let needsReset = true;
let lastResultFb = null;
let inputFb = null;
let rankFb = null;

textureMask.onLinkChanged =
    textureGroup.onLinkChanged =
    invert.onChange =
    structure.onChange =
    stagger.onChange =
    sort.onChange = updateDefines;

reset.onTriggered =
    keepSorting.onChange = () => { needsReset = true; };

mode.onChange = updateMode;

op.onDelete = () =>
{
    if (lastResultFb) lastResultFb.dispose();
    if (inputFb) inputFb.dispose();
    if (rankFb) rankFb.dispose();
};

updateDefines();
updateMode();

function addSegmentUniforms(s)
{
    new CGL.Uniform(s, "t", "tex", 0);
    new CGL.Uniform(s, "t", "texMask", 1);
    new CGL.Uniform(s, "t", "texGroup", 2);
    new CGL.Uniform(s, "f", "segmentLength", maxLength);
    new CGL.Uniform(s, "f", "thresholdLow", thresholdLow);
    new CGL.Uniform(s, "f", "thresholdHigh", thresholdHigh);
}

function updateMode()
{
    const isSegments = mode.get() == "Segments";

    maxLength.setUiAttribs({ "greyout": !isSegments });
    thresholdLow.setUiAttribs({ "greyout": !isSegments });
    thresholdHigh.setUiAttribs({ "greyout": !isSegments });
    stagger.setUiAttribs({ "greyout": !isSegments });

    iterations.setUiAttribs({ "greyout": isSegments });
    keepSorting.setUiAttribs({ "greyout": isSegments });
    inputAmount.setUiAttribs({ "greyout": isSegments });
    reset.setUiAttribs({ "greyout": isSegments });

    needsReset = true;
}

function updateDefines()
{
    for (let i = 0; i < allShaders.length; i++)
    {
        const s = allShaders[i];
        s.toggleDefine("SORT_LUM", sort.get() == "Luminance");
        s.toggleDefine("SORT_R", sort.get() == "R");
        s.toggleDefine("SORT_G", sort.get() == "G");
        s.toggleDefine("SORT_B", sort.get() == "B");

        s.toggleDefine("STR_ROWS", structure.get() == "Rows");
        s.toggleDefine("STR_COLS", structure.get() == "Columns");
        s.toggleDefine("INVERT", invert.get());
        s.toggleDefine("STAGGER", stagger.get());

        s.toggleDefine("MASK", textureMask.isLinked());
        s.toggleDefine("GROUP", textureGroup.isLinked());
    }
}

function bindInputTextures(source)
{
    cgl.setTexture(0, source.tex);
    if (textureMask.get()) cgl.setTexture(1, textureMask.get().tex);
    if (textureGroup.get()) cgl.setTexture(2, textureGroup.get().tex);
}

function renderSegments(effect)
{
    const source = effect.getCurrentSourceTexture();

    if (!rankFb)
    {
        rankFb = new CGL.Framebuffer2(cgl, source.width, source.height,
            {
                "pixelFormat": CGL.Texture.PFORMATSTR_RGBA32F,
                "filter": CGL.Texture.FILTER_NEAREST,
                "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE
            });
    }
    if (rankFb.getWidth() != source.width || rankFb.getHeight() != source.height) rankFb.setSize(source.width, source.height);

    effect.endEffect();

    cgl.tempData.renderOffscreen = true;
    rankFb.renderStart(cgl);
    bindInputTextures(source);
    cgl.pushShader(rankShader);
    copyMesh.render(rankShader);
    cgl.popShader();
    rankFb.renderEnd();
    cgl.tempData.renderOffscreen = false;

    effect.continueEffect();

    cgl.pushShader(segmentShader);
    effect.bind();
    bindInputTextures(source);
    cgl.setTexture(4, rankFb.getTextureColor().tex);
    effect.finish();
    cgl.popShader();
}

function matchesSource(fb, source)
{
    if (!fb) return false;
    if (fb.getTextureColor().pixelFormat != source.pixelFormat) return false;
    return fb.getWidth() == source.width && fb.getHeight() == source.height;
}

function copyToFb(fb, effect)
{
    const source = effect.getCurrentSourceTexture();

    if (fb && fb.getTextureColor().pixelFormat != source.pixelFormat)
    {
        fb.dispose();
        fb = null;
    }

    if (!fb)
    {
        fb = new CGL.Framebuffer2(cgl, source.width, source.height,
            {
                "pixelFormat": source.pixelFormat,
                "filter": CGL.Texture.FILTER_NEAREST,
                "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE
            });
    }
    if (fb.getWidth() != source.width || fb.getHeight() != source.height) fb.setSize(source.width, source.height);

    effect.endEffect();

    cgl.tempData.renderOffscreen = true;
    fb.renderStart(cgl);
    cgl.setTexture(0, source.tex);
    cgl.pushShader(copyShader);
    copyMesh.render(copyShader);
    cgl.popShader();
    fb.renderEnd();
    cgl.tempData.renderOffscreen = false;

    effect.continueEffect();
    return fb;
}

function mixWithMask(effect)
{
    cgl.pushShader(maskMixShader);
    effect.bind();
    cgl.setTexture(0, effect.getCurrentSourceTexture().tex);
    cgl.setTexture(1, textureMask.get().tex);
    cgl.setTexture(3, inputFb.getTextureColor().tex);
    effect.finish();
    cgl.popShader();
}

render.onTriggered = () =>
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    const effect = cgl.currentTextureEffect;
    if (mode.get() == "Segments") renderSegments(effect);
    else renderIterative(effect);

    trigger.trigger();
};

function renderIterative(effect)
{
    const continueFromLast = keepSorting.get() && !needsReset && matchesSource(lastResultFb, effect.getCurrentSourceTexture());
    needsReset = false;
    if (!continueFromLast) parity = 0;

    const useMask = textureMask.isLinked() && textureMask.get();
    if (useMask) inputFb = copyToFb(inputFb, effect);

    const passes = Math.max(1, iterations.get());

    cgl.pushShader(shader);
    for (let i = 0; i < passes; i++)
    {
        effect.bind();

        const mixInput = i == 0 && continueFromLast;
        if (mixInput) cgl.setTexture(0, lastResultFb.getTextureColor().tex);
        else cgl.setTexture(0, effect.getCurrentSourceTexture().tex);
        cgl.setTexture(3, effect.getCurrentSourceTexture().tex);
        if (mixInput) uniInputAmount.setValue(inputAmount.get());
        else uniInputAmount.setValue(0);
        if (textureMask.get()) cgl.setTexture(1, textureMask.get().tex);
        if (textureGroup.get()) cgl.setTexture(2, textureGroup.get().tex);

        uniParity.setValue(parity);
        parity = 1 - parity;

        effect.finish();
    }
    cgl.popShader();

    if (keepSorting.get()) lastResultFb = copyToFb(lastResultFb, effect);
    if (useMask) mixWithMask(effect);
}
