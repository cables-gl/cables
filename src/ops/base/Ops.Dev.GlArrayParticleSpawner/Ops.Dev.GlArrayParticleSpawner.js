const
    render = op.inTriggerButton("render"),
    inTexture = op.inTexture("Texture"),
    inTexSpawns = op.inTexture("Spawn Coords"),
    inTexLifetimes = op.inTexture("Lifetimes"),
    inTime=op.inFloat("Time",0),
    useVPSize = op.inValueBool("use original size", true),
    width = op.inValueInt("width", 640),
    height = op.inValueInt("height", 360),
    trigger = op.outTrigger("trigger"),
    texOut = op.outTexture("texture_out", null)
    ;



let autoRefreshTimeout = null;
const cgl = op.patch.cgl;
let lastTex = null;
let effect = null;
let tex = null;
let needsResUpdate = true;

let w = 2, h = 2;
const prevViewPort = [0, 0, 0, 0];
let reInitEffect = true;

op.setPortGroup("Size", [useVPSize, width, height]);

const bgShader = new CGL.Shader(cgl, "copytexture");
bgShader.setSource(bgShader.getDefaultVertexShader(), attachments.copytexture_frag);

const unitime = new CGL.Uniform(bgShader, "f", "time", inTime);

const textureUniform = new CGL.Uniform(bgShader, "t", "tex", 0);
let unitexSpawns = new CGL.Uniform(bgShader, "t", "texSpawnCoords", 1);
let unitexLifetimes = new CGL.Uniform(bgShader, "t", "texLifetimes", 2);




    inTexSpawns.onChange = updateSoon;

render.onLinkChanged =
inTexture.onLinkChanged =
inTexture.onChange = () =>
{
    if (!inTexture.get()) texOut.set(CGL.Texture.getEmptyTexture(cgl));
    updateSoon();
};

render.onTriggered = doRender;

// updateSizePorts();
// updateParams();

function initEffect()
{
    if (effect)effect.delete();
    if (tex)
    {
        tex.delete();
        tex = null;
    }

    effect = new CGL.TextureEffect(cgl, { "isFloatingPointTexture": true, "clear": false });

    if (!tex ||
        tex.width != Math.floor(width.get()) ||
        tex.height != Math.floor(height.get())
    )
    {
        if (tex) tex.delete();
        tex = new CGL.Texture(cgl,
            {
                "name": "copytexture_" + op.id,
                "isFloatingPointTexture": true,
                "filter": CGL.Texture.FILTER_NEAREST,
                "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
                "width": Math.floor(width.get()),
                "height": Math.floor(height.get()),
            });
    }

    effect.setSourceTexture(tex);
    texOut.set(null);
    reInitEffect = false;
}

function updateSoon()
{
    updateParams();
    if (render.links.length === 0)
    {
        reInitEffect = true;

        op.patch.cgl.off(autoRefreshTimeout);
        autoRefreshTimeout = op.patch.cgl.on("beginFrame", () =>
        {
            op.patch.cgl.off(autoRefreshTimeout);

            if (needsResUpdate)updateResolution();
            if (!effect)console.log("has no effect");
            if (!inTexture.get()) console.log("has no intexture");

            doRender();
        });
    }
}

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
        tex.filter = CGL.Texture.FILTER_NEAREST;
        tex.setSize(w, h);
        effect.setSourceTexture(tex);
    }


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
    if (!inTexture.get())
    {
        lastTex = null;// CGL.Texture.getEmptyTexture(cgl);
        return;
    }

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

    if (inTexSpawns.get())cgl.setTexture(1, inTexSpawns.get().tex);
    if (inTexLifetimes.get())cgl.setTexture(2, inTexLifetimes.get().tex);


    cgl.pushBlend(false);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    cgl.popBlend();

    texOut.set(effect.getCurrentSourceTexture());

    effect.endEffect();

    cgl.setViewPort(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

    cgl.currentTextureEffect = oldEffect;

    cgl.setTexture(0, CGL.Texture.getEmptyTexture(cgl).tex);


    trigger.trigger();
}

function updateParams()
{
    reInitEffect = true;



}
