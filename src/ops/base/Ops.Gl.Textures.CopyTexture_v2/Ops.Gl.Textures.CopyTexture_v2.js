const
    render = op.inTriggerButton("render"),
    inTexture = op.inTexture("Texture"),
    inTextureMask = op.inTexture("Alpha Mask"),
    useVPSize = op.inValueBool("use original size", true),
    width = op.inValueInt("width", 640),
    height = op.inValueInt("height", 360),
    tfilter = op.inSwitch("filter", ["nearest", "linear", "mipmap"], "linear"),
    twrap = op.inValueSelect("wrap", ["clamp to edge", "repeat", "mirrored repeat"], "clamp to edge"),
    fpTexture = op.inValueBool("HDR"),
    alphaMaskMethod = op.inSwitch("Alpha Mask Source", ["A", "1"], "A"),
    greyscale = op.inSwitch("Convert Greyscale", ["Off", "R", "G", "B", "A", "Luminance"], "Off"),
    invertR = op.inBool("Invert R", false),
    invertG = op.inBool("Invert G", false),
    invertB = op.inBool("Invert B", false),
    invertA = op.inBool("Invert A", false),

    trigger = op.outTrigger("trigger"),
    texOut = op.outTexture("texture_out", null),
    outRatio = op.outNumber("Aspect Ratio");

alphaMaskMethod.setUiAttribs({ "hidePort": true });
greyscale.setUiAttribs({ "hidePort": true });
invertR.setUiAttribs({ "hidePort": true });
invertG.setUiAttribs({ "hidePort": true });
invertB.setUiAttribs({ "hidePort": true });

let autoRefreshTimeout = null;
const cgl = op.patch.cgl;
let lastTex = null;
let effect = null;
let tex = null;
let needsResUpdate = true;
let oldTex = null;

let w = 2, h = 2;
const prevViewPort = [0, 0, 0, 0];
let reInitEffect = true;

op.toWorkPortsNeedToBeLinked(render, inTexture);
op.setPortGroup("Size", [useVPSize, width, height]);

const bgShader = new CGL.Shader(cgl, "copytexture");
bgShader.setSource(bgShader.getDefaultVertexShader(), attachments.copytexture_frag);
const textureUniform = new CGL.Uniform(bgShader, "t", "tex", 0);
let textureMaskUniform = new CGL.Uniform(bgShader, "t", "texMask", 1);

let selectedFilter = CGL.Texture.FILTER_LINEAR;
let selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

alphaMaskMethod.onChange = () => { updateSoon(); };
greyscale.onChange = () => { updateSoon(); };
invertR.onChange = () => { updateSoon(); };
invertG.onChange = () => { updateSoon(); };
invertB.onChange = () => { updateSoon(); };
twrap.onChange = () => { updateSoon(); };
tfilter.onChange = () => { updateSoon(); };
fpTexture.onChange = () => { updateSoon(); };
render.onLinkChanged = () => { updateSoon(); };
inTexture.onLinkChanged = () => { updateSoon(); };
inTexture.onChange = () =>
{
    if (oldTex != inTexture.get()) { updateSoon(); }
    oldTex = inTexture.get();
};
inTextureMask.onChange = () => { updateSoon(); };

render.onTriggered = doRender;
updateSizePorts();

function initEffect()
{
    if (effect)effect.delete();
    if (tex)
    {
        tex.delete();
        tex = null;
    }

    effect = new CGL.TextureEffect(cgl, { "isFloatingPointTexture": fpTexture.get(), "clear": false });

    if (!tex ||
        tex.width != Math.floor(width.get()) ||
        tex.height != Math.floor(height.get()) ||
        tex.wrap != selectedWrap ||
        tex.isFloatingPoint() != fpTexture.get()
    )
    {
        if (tex) tex.delete();
        tex = new CGL.Texture(cgl,
            {
                "name": "copytexture_" + op.id,
                "isFloatingPointTexture": fpTexture.get(),
                "filter": selectedFilter,
                "wrap": selectedWrap,
                "width": Math.floor(width.get()),
                "height": Math.floor(height.get()),
            });
    }

    effect.setSourceTexture(tex);
    // texOut.set(CGL.Texture.getEmptyTexture(cgl));
    reInitEffect = false;
}

function updateSoon()
{
    updateParams();
    reInitEffect = true;

    if (!render.isLinked() || !inTexture.isLinked()) texOut.setRef(CGL.Texture.getEmptyTexture(cgl));
}

function updateResolution()
{
    if (!inTexture.get() || inTexture.get() == CGL.Texture.getEmptyTexture(cgl)) return;
    if (!effect)initEffect();

    if (useVPSize.get())
    {
        w = inTexture.get().width;
        h = inTexture.get().height;
    }
    else
    {
        w = Math.floor(width.get());
        h = Math.floor(height.get());
    }

    if ((w != tex.width || h != tex.height) && (w !== 0 && h !== 0))
    {
        height.set(h);
        width.set(w);
        tex.filter = selectedFilter;
        tex.setSize(w, h);
        outRatio.set(w / h);
        effect.setSourceTexture(tex);
    }

    // if (texOut.get() && selectedFilter != CGL.Texture.FILTER_NEAREST)
    // {
    //     if (!texOut.get().isPowerOfTwo()) op.setUiError("hintnpot", "texture dimensions not power of two! - texture filtering when scaling will not work on ios devices.", 0);
    //     else op.setUiError("hintnpot", null, 0);
    // }
    // else op.setUiError("hintnpot", null, 0);

    needsResUpdate = false;
}

function updateSizePorts()
{
    width.setUiAttribs({ "greyout": useVPSize.get() });
    height.setUiAttribs({ "greyout": useVPSize.get() });
}

function updateResolutionLater()
{
    needsResUpdate = true;
    updateSoon();
}

useVPSize.onChange = function ()
{
    updateSizePorts();
    if (useVPSize.get())
    {
        width.onChange = null;
        height.onChange = null;
    }
    else
    {
        width.onChange = updateResolutionLater;
        height.onChange = updateResolutionLater;
    }
    updateResolution();
};

function doRender()
{
    // op.patch.removeOnAnimCallback(doRender);
    // if (!inTexture.get())

    if (!inTexture.get() || inTexture.get() == CGL.Texture.getEmptyTexture(cgl)) texOut.setRef(CGL.Texture.getEmptyTexture(cgl));

    if (!inTexture.get() || inTexture.get() == CGL.Texture.getEmptyTexture(cgl))
    {
        lastTex = null;// CGL.Texture.getEmptyTexture(cgl);
        trigger.trigger();
        return;
    }
    else
    if (!effect || reInitEffect || lastTex != inTexture.get())
    {
        initEffect();
    }
    const vp = cgl.getViewPort();
    prevViewPort[0] = vp[0];
    prevViewPort[1] = vp[1];
    prevViewPort[2] = vp[2];
    prevViewPort[3] = vp[3];

    updateResolution();

    lastTex = inTexture.get();
    const oldEffect = cgl.currentTextureEffect;
    cgl.currentTextureEffect = effect;
    effect.setSourceTexture(tex);

    effect.startEffect();

    // render background color...
    cgl.pushShader(bgShader);
    cgl.currentTextureEffect.bind();
    cgl.setTexture(0, inTexture.get().tex);
    if (inTextureMask.get())cgl.setTexture(1, inTextureMask.get().tex);

    cgl.pushBlend(false);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    cgl.popBlend();

    texOut.setRef(effect.getCurrentSourceTexture());

    effect.endEffect();

    cgl.setViewPort(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

    cgl.currentTextureEffect = oldEffect;

    cgl.setTexture(0, CGL.Texture.getEmptyTexture(cgl).tex);

    trigger.trigger();
}

function updateParams()
{
    bgShader.toggleDefine("TEX_MASK", inTextureMask.get());

    bgShader.toggleDefine("GREY_R", greyscale.get() === "R");
    bgShader.toggleDefine("GREY_G", greyscale.get() === "G");
    bgShader.toggleDefine("GREY_B", greyscale.get() === "B");
    bgShader.toggleDefine("GREY_A", greyscale.get() === "A");
    bgShader.toggleDefine("GREY_LUMI", greyscale.get() === "Luminance");

    bgShader.toggleDefine("ALPHA_1", alphaMaskMethod.get() === "1");
    bgShader.toggleDefine("ALPHA_A", alphaMaskMethod.get() === "A");

    bgShader.toggleDefine("INVERT_R", invertR.get());
    bgShader.toggleDefine("INVERT_G", invertG.get());
    bgShader.toggleDefine("INVERT_B", invertB.get());
    bgShader.toggleDefine("INVERT_A", invertA.get());

    if (twrap.get() == "repeat") selectedWrap = CGL.Texture.WRAP_REPEAT;
    else if (twrap.get() == "mirrored repeat") selectedWrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    else if (twrap.get() == "clamp to edge") selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    if (tfilter.get() == "nearest") selectedFilter = CGL.Texture.FILTER_NEAREST;
    else if (tfilter.get() == "linear") selectedFilter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") selectedFilter = CGL.Texture.FILTER_MIPMAP;

    if (bgShader.needsRecompile())
    {
        reInitEffect = true;
    }
    if (tex && (
        tex.width != Math.floor(width.get()) ||
        tex.height != Math.floor(height.get()) ||
        tex.wrap != selectedWrap ||
        tex.isFloatingPoint() != fpTexture.get()
    ))
    {
        reInitEffect = true;
    }
}
