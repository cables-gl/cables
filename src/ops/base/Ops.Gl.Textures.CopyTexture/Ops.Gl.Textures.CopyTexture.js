const
    render = op.inTrigger("render"),
    inTexture = op.inTexture("Texture"),
    inTextureMask = op.inTexture("Alpha Mask"),
    useVPSize = op.inValueBool("use original size"),
    width = op.inValueInt("width"),
    height = op.inValueInt("height"),
    tfilter = op.inSwitch("filter", ["nearest", "linear", "mipmap"]),
    twrap = op.inValueSelect("wrap", ["clamp to edge", "repeat", "mirrored repeat"]),
    fpTexture = op.inValueBool("HDR"),
    alphaMaskMethod = op.inSwitch("Alpha Mask Source", ["R", "A", "Luminance"]),

    trigger = op.outTrigger("trigger"),
    texOut = op.outTexture("texture_out"),
    outRatio = op.outValue("Aspect Ratio");

texOut.set(null);
const cgl = op.patch.cgl;
let effect = null;
let tex = null;

let w = 8, h = 8;
const prevViewPort = [0, 0, 0, 0];
let reInitEffect = true;

op.setPortGroup("Size", [useVPSize, width, height]);

const bgShader = new CGL.Shader(cgl, "imgcompose bg");
bgShader.setSource(bgShader.getDefaultVertexShader(), attachments.copytexture_frag);
const textureUniform = new CGL.Uniform(bgShader, "t", "tex", 0);
let textureMaskUniform = new CGL.Uniform(bgShader, "t", "texMask", 1);

let selectedFilter = CGL.Texture.FILTER_LINEAR;
let selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

alphaMaskMethod.onChange =
    inTextureMask.onChange = updateDefines;

updateDefines();

function initEffect()
{
    if (effect)effect.delete();
    if (tex)tex.delete();

    effect = new CGL.TextureEffect(cgl, { "isFloatingPointTexture": fpTexture.get(), "clear": false });


    tex = new CGL.Texture(cgl,
        {
            "name": "copytexture",
            "isFloatingPointTexture": fpTexture.get(),
            "filter": selectedFilter,
            "wrap": selectedWrap,
            "width": Math.floor(width.get()),
            "height": Math.floor(height.get()),
        });

    effect.setSourceTexture(tex);
    texOut.set(null);
    reInitEffect = false;
}

fpTexture.onChange = function ()
{
    reInitEffect = true;
};

function updateResolution()
{
    if (!effect)initEffect();
    if (!inTexture.get()) return;

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

    if (texOut.get())
        if (!texOut.get().isPowerOfTwo())
        {
            if (!op.uiAttribs.hint)
                op.uiAttr(
                    {
                        "hint": "texture dimensions not power of two! - texture filtering will not work.",
                        "warning": null
                    });
        }
        else
        if (op.uiAttribs.hint)
        {
            op.uiAttr({ "hint": null, "warning": null }); // todo only when needed...
        }
}


function updateSizePorts()
{
    if (useVPSize.get())
    {
        width.setUiAttribs({ "greyout": true });
        height.setUiAttribs({ "greyout": true });
    }
    else
    {
        width.setUiAttribs({ "greyout": false });
        height.setUiAttribs({ "greyout": false });
    }
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
        width.onChange = updateResolution;
        height.onChange = updateResolution;
    }
    updateResolution();
};

let lastTex = null;

const doRender = function ()
{
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

    if (!inTexture.get()) return;

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

    texOut.set(effect.getCurrentSourceTexture());

    effect.endEffect();

    cgl.setViewPort(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

    cgl.currentTextureEffect = oldEffect;

    trigger.trigger();
};

function updateDefines()
{
    bgShader.toggleDefine("TEX_MASK", inTextureMask.get());

    textureMaskUniform = new CGL.Uniform(bgShader, "t", "texMask", 1);
}

function onWrapChange()
{
    if (twrap.get() == "repeat") selectedWrap = CGL.Texture.WRAP_REPEAT;
    if (twrap.get() == "mirrored repeat") selectedWrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (twrap.get() == "clamp to edge") selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reInitEffect = true;
    updateResolution();
}

twrap.set("clamp to edge");
twrap.onChange = onWrapChange;

function onFilterChange()
{
    if (tfilter.get() == "nearest") selectedFilter = CGL.Texture.FILTER_NEAREST;
    else if (tfilter.get() == "linear") selectedFilter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") selectedFilter = CGL.Texture.FILTER_MIPMAP;

    reInitEffect = true;
    updateResolution();
}

tfilter.set("linear");
tfilter.onChange = onFilterChange;

useVPSize.set(true);
render.onTriggered = doRender;

width.set(640);
height.set(360);
updateSizePorts();
