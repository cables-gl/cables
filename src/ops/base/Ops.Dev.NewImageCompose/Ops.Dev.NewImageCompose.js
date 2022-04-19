const
    render = op.inTrigger("Render"),
    inTex = op.inTexture("Base Texture"),
    inUseVPSize = op.inBool("Use viewport size", true),
    width = op.inValueInt("Width", 640),
    height = op.inValueInt("Height", 480),
    inFilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "linear"),
    inWrap = op.inValueSelect("Wrap", ["clamp to edge", "repeat", "mirrored repeat"], "repeat"),
    inPixel = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA8UB),

    trigger = op.outTrigger("Next"),
    texOut = op.outTexture("texture_out"),
    outRatio = op.outNumber("Aspect Ratio"),
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height");

const cgl = op.patch.cgl;
op.setPortGroup("Texture Size", [inUseVPSize, width, height, inWrap, inFilter, inPixel]);

texOut.set(CGL.Texture.getEmptyTexture(cgl));

const prevViewPort = [0, 0, 0, 0];
let effect = null;
let tex = null;
let reInitEffect = true;
let isFloatTex = false;
inWrap.onChange =
    inFilter.onChange =
    inPixel.onChange = reInitLater;

inTex.onLinkChanged =
inUseVPSize.onChange = updateUi;

render.onTriggered =
    op.preRender = doRender;

updateUi();

function initEffect()
{
    if (effect)effect.delete();
    if (tex)tex.delete();

    effect = new CGL.TextureEffect(cgl, { "isFloatingPointTexture": getFloatingPoint() });

    tex = new CGL.Texture(cgl,
        {
            "name": "image_compose_v2_" + op.id,
            "isFloatingPointTexture": getFloatingPoint(),
            "filter": getFilter(),
            "wrap": getWrap(),
            "width": getWidth(),
            "height": getHeight()
        });

    effect.setSourceTexture(tex);

    outWidth.set(getWidth());
    outHeight.set(getHeight());

    outRatio.set(getWidth() / getHeight());

    texOut.set(CGL.Texture.getEmptyTexture(cgl));

    reInitEffect = false;
    updateUi();
}

function getFilter()
{
    if (inTex.get()) return inTex.get().filter;

    if (inFilter.get() == "nearest") return CGL.Texture.FILTER_NEAREST;
    if (inFilter.get() == "linear") return CGL.Texture.FILTER_LINEAR;
    if (inFilter.get() == "mipmap") return CGL.Texture.FILTER_MIPMAP;
}

function getWrap()
{
    if (inTex.get()) return inTex.get().wrap;
    if (inWrap.get() == "repeat") return CGL.Texture.WRAP_REPEAT;
    if (inWrap.get() == "mirrored repeat") return CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (inWrap.get() == "clamp to edge") return CGL.Texture.WRAP_CLAMP_TO_EDGE;
}

function getFloatingPoint()
{
    if (inTex.get()) isFloatTex = inTex.get().isFloatingPoint();
    isFloatTex = inPixel.get() == CGL.Texture.PFORMATSTR_RGBA32F;
    return isFloatTex;
}

function getWidth()
{
    if (inTex.get()) return inTex.get().width;
    if (inUseVPSize.get()) return cgl.getViewPort()[2];
    return Math.ceil(width.get());
}

function getHeight()
{
    if (inTex.get()) return inTex.get().height;
    else if (inUseVPSize.get()) return cgl.getViewPort()[3];
    else return Math.ceil(height.get());
}

function reInitLater()
{
    reInitEffect = true;
}

function updateResolution()
{
    if ((
        getWidth() != tex.width ||
        getHeight() != tex.height ||
        tex.isFloatingPoint() != getFloatingPoint() ||
        tex.filter != getFilter() ||
        tex.wrap != getWrap()
    ) && (getWidth() !== 0 && getHeight() !== 0))
    {
        initEffect();
        effect.setSourceTexture(tex);
        texOut.set(CGL.Texture.getEmptyTexture(cgl));
        texOut.set(tex);
    }
}

function updateUi()
{
    width.setUiAttribs({ "greyout": inUseVPSize.get() || inTex.isLinked() });
    height.setUiAttribs({ "greyout": inUseVPSize.get() || inTex.isLinked() });
    inUseVPSize.setUiAttribs({ "greyout": inTex.isLinked() });
    inFilter.setUiAttribs({ "greyout": inTex.isLinked() });
    inWrap.setUiAttribs({ "greyout": inTex.isLinked() });
    inPixel.setUiAttribs({ "greyout": inTex.isLinked() });

    if (tex)
        if (getFloatingPoint() && getFilter() == "mipmap") op.setUiError("fpmipmap", "Don't use mipmap and 32bit at the same time, many systems do not support this.");
        else op.setUiError("fpmipmap", null);
}

op.preRender = function ()
{
    doRender();
};

function doRender()
{
    if (!effect || reInitEffect) initEffect();

    const vp = cgl.getViewPort();
    prevViewPort[0] = vp[0];
    prevViewPort[1] = vp[1];
    prevViewPort[2] = vp[2];
    prevViewPort[3] = vp[3];

    cgl.pushBlend(false);

    updateResolution();

    const oldEffect = cgl.currentTextureEffect;
    cgl.currentTextureEffect = effect;
    cgl.currentTextureEffect.imgCompVer = 3;
    cgl.currentTextureEffect.width = width.get();
    cgl.currentTextureEffect.height = height.get();
    effect.setSourceTexture(tex);

    effect.startEffect(inTex.get() || CGL.Texture.getEmptyTexture(cgl, isFloatTex), true);

    trigger.trigger();

    texOut.set(CGL.Texture.getEmptyTexture(cgl));
    texOut.set(effect.getCurrentSourceTexture());

    effect.endEffect();

    cgl.setViewPort(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

    cgl.popBlend(false);
    cgl.currentTextureEffect = oldEffect;
}
