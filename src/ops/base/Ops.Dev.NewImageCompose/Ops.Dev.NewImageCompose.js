const
    render = op.inTrigger("Render"),
    inTex = op.inTexture("Base Texture"),
    inUseVPSize = op.inBool("Use viewport size", true),
    width = op.inValueInt("Width", 640),
    height = op.inValueInt("Height", 480),
    inFilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "linear"),
    inWrap = op.inValueSelect("Wrap", ["clamp to edge", "repeat", "mirrored repeat"], "repeat"),
    fpTexture = op.inValueBool("HDR"),

    trigger = op.outTrigger("Next"),
    texOut = op.outTexture("texture_out"),
    outRatio = op.outValue("Aspect Ratio");

const cgl = op.patch.cgl;
op.setPortGroup("Texture Size", [inUseVPSize, width, height]);
op.setPortGroup("Texture Settings", [inWrap, inFilter, fpTexture]);

const prevViewPort = [0, 0, 0, 0];
texOut.set(CGL.Texture.getEmptyTexture(cgl));
let effect = null;
let tex = null;
let w = 8, h = 8;
let reInitEffect = true;

inWrap.onChange =
    inFilter.onChange =
    fpTexture.onChange = reInitLater;

render.onTriggered =
    op.preRender = doRender;

updateUi();

function initEffect()
{
    if (effect)effect.delete();
    if (tex)tex.delete();

    if (fpTexture.get() && inFilter.get() == "mipmap") op.setUiError("fpmipmap", "Don't use mipmap and HDR at the same time, many systems do not support this.");
    else op.setUiError("fpmipmap", null);

    effect = new CGL.TextureEffect(cgl, { "isFloatingPointTexture": fpTexture.get() });

    let selectedFilter = CGL.Texture.FILTER_LINEAR;
    let selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    if (inWrap.get() == "repeat") selectedWrap = CGL.Texture.WRAP_REPEAT;
    else if (inWrap.get() == "mirrored repeat") selectedWrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    else if (inWrap.get() == "clamp to edge") selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    if (inFilter.get() == "nearest") selectedFilter = CGL.Texture.FILTER_NEAREST;
    else if (inFilter.get() == "linear") selectedFilter = CGL.Texture.FILTER_LINEAR;
    else if (inFilter.get() == "mipmap") selectedFilter = CGL.Texture.FILTER_MIPMAP;

    tex = new CGL.Texture(cgl,
        {
            "name": "image_compose_v2_" + op.id,
            "isFloatingPointTexture": fpTexture.get(),
            "filter": selectedFilter,
            "wrap": selectedWrap,
            "width": Math.ceil(width.get()),
            "height": Math.ceil(height.get()),
        });

    effect.setSourceTexture(tex);
    texOut.set(CGL.Texture.getEmptyTexture(cgl));

    reInitEffect = false;
}

function reInitLater()
{
    reInitEffect = true;
}

function updateResolution()
{
    if (!effect)initEffect();

    if (inTex.get())
    {
        w = inTex.get().width;
        h = inTex.get().height;
    }
    else if (inUseVPSize.get())
    {
        w = cgl.getViewPort()[2];
        h = cgl.getViewPort()[3];
    }
    else
    {
        w = Math.ceil(width.get());
        h = Math.ceil(height.get());
    }

    outRatio.set(w / h);

    if ((w != tex.width || h != tex.height) && (w !== 0 && h !== 0))
    {
        tex.setSize(w, h);

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
    fpTexture.setUiAttribs({ "greyout": inTex.isLinked() });
}

inTex.onLinkChanged =
inUseVPSize.onChange = updateUi;

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
    cgl.currentTextureEffect.width = width.get();
    cgl.currentTextureEffect.height = height.get();
    effect.setSourceTexture(tex);

    effect.startEffect(inTex.get() || CGL.Texture.getEmptyTexture(cgl), true);

    trigger.trigger();

    texOut.set(effect.getCurrentSourceTexture());

    effect.endEffect();

    cgl.setViewPort(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

    cgl.popBlend(false);
    cgl.currentTextureEffect = oldEffect;
}
