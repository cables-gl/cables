const
    exec = op.inTrigger("Render"),
    inShader = op.inObject("Shader", null, "shader"),
    // inVPSize = op.inValueBool("Use Viewport Size", true),
    inSize = op.inSwitch("Size", ["Canvas", "Manual"], "Manual"),
    inWidth = op.inValueInt("Width", 512),
    inHeight = op.inValueInt("Height", 512),
    tfilter = op.inValueSelect("filter", ["nearest", "linear", "mipmap"]),
    aniso = op.inSwitch("Anisotropic", ["0", "1", "2", "4", "8", "16"], "0"),
    twrap = op.inValueSelect("wrap", ["clamp to edge", "repeat", "mirrored repeat"], "clamp to edge"),
    inPixelFormat = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA8UB),
    inNumTex = op.inSwitch("Num Textures", ["1", "4"], "1"),
    next = op.outTrigger("Next"),
    outTex = op.outTexture("Texture"),
    outTex2 = op.outTexture("Texture 2"),
    outTex3 = op.outTexture("Texture 3"),
    outTex4 = op.outTexture("Texture 4");

op.setPortGroup("Texture Size", [inSize, inWidth, inHeight]);
op.setPortGroup("Texture settings", [tfilter, twrap, inPixelFormat, aniso]);

let numTextures = 1;
const cgl = op.patch.cgl;
const prevViewPort = [0, 0, 0, 0];
const effect = null;
const drawBuffArr = [];
let lastShader = null;
let shader = null;

inWidth.onChange =
    inHeight.onChange =
    inPixelFormat.onChange =
    tfilter.onChange =
    inNumTex.onChange =
    aniso.onChange =
    twrap.onChange = initFbLater;

inSize.onChange = updateUI;

const showingError = false;

let fb = null;
const tex = null;
let needInit = true;

const mesh = CGL.MESHES.getSimpleRect(cgl, "shader2texture rect");

op.toWorkPortsNeedToBeLinked(inShader);

tfilter.set("nearest");

updateUI();

function warning()
{
    if (tfilter.get() == "mipmap" && tex && tex.isFloatingPoint())
    {
        op.setUiError("warning", "HDR and mipmap filtering at the same time is not possible");
    }
    else
    {
        op.setUiError("warning", null);
    }
}

function updateUI()
{
    aniso.setUiAttribs({ "greyout": tfilter.get() != "mipmap" });
    inWidth.setUiAttribs({ "greyout": inSize.get() == "Canvas" });
    inHeight.setUiAttribs({ "greyout": inSize.get() == "Canvas" });
}

function initFbLater()
{
    needInit = true;
    warning();
    updateUI();
}

function resetShader()
{
    if (shader) shader.dispose();
    lastShader = null;
    shader = null;
}

function initFb()
{
    needInit = false;
    if (fb)fb.delete();

    const oldLen = drawBuffArr.length;
    numTextures = parseInt(inNumTex.get());
    drawBuffArr.length = 0;
    for (let i = 0; i < numTextures; i++)drawBuffArr[i] = true;

    if (oldLen != drawBuffArr.length)
    {
        resetShader();
    }

    fb = null;

    let w = inWidth.get();
    let h = inHeight.get();

    if (inSize.get() == "Canvas")
    {
        w = cgl.canvasWidth;
        h = cgl.canvasHeight;
    }

    let filter = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "linear") filter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") filter = CGL.Texture.FILTER_MIPMAP;

    let selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
    if (twrap.get() == "repeat") selectedWrap = CGL.Texture.WRAP_REPEAT;
    if (twrap.get() == "mirrored repeat") selectedWrap = CGL.Texture.WRAP_MIRRORED_REPEAT;

    const cgl_aniso = Math.min(cgl.maxAnisotropic, parseFloat(aniso.get()));

    if (cgl.glVersion >= 2)
    {
        fb = new CGL.Framebuffer2(cgl, w, h,
            {
                "anisotropic": cgl_aniso,
                // "isFloatingPointTexture": inFloatingPoint.get(),
                "pixelFormat": inPixelFormat.get(),
                "multisampling": false,
                "numRenderBuffers": numTextures,
                "wrap": selectedWrap,
                "filter": filter,
                "depth": true,
                "multisamplingSamples": 0,
                "clear": true
            });
    }
    else
    {
        fb = new CGL.Framebuffer(cgl, inWidth.get(), inHeight.get(),
            {
                "isFloatingPointTexture": inFloatingPoint.get(),
                "filter": filter,
                "wrap": selectedWrap
            });
    }
}

exec.onTriggered = function ()
{
    if (!fb || needInit)initFb();

    if (
        inSize.get() == "Manual" &&
        (
            fb.getTextureColor().width != inWidth.get() ||
            fb.getTextureColor().height != inHeight.get()
        ))
    {
        initFb();
    }
    else if (inSize.get() == "Canvas" &&
        fb &&
        (
            fb.getTextureColor().width != cgl.canvasWidth ||
            fb.getTextureColor().height != cgl.canvasHeight
        )) initFb();

    if (!inShader.get() || !inShader.get().setDrawBuffers) return;

    if (inShader.get() != lastShader)
    {
        lastShader = inShader.get();
        shader = inShader.get().copy();

        shader.setDrawBuffers(drawBuffArr);
    }

    if (!shader)
    {
        outTex.set(null);
        return;
    }

    cgl.pushViewPort(0, 0, inWidth.get(), inHeight.get());

    fb.renderStart(cgl);

    cgl.pushPMatrix();
    mat4.identity(cgl.pMatrix);

    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);

    cgl.pushModelMatrix();
    mat4.identity(cgl.mMatrix);

    cgl.pushShader(inShader.get());
    if (shader.bindTextures) shader.bindTextures();

    cgl.pushBlend(false);

    mesh.render(inShader.get());

    cgl.popBlend();

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();
    fb.renderEnd(cgl);

    if (numTextures >= 2)
    {
        outTex.setRef(fb.getTextureColorNum(0));
        outTex2.setRef(fb.getTextureColorNum(1));
        outTex3.setRef(fb.getTextureColorNum(2));
        outTex4.setRef(fb.getTextureColorNum(3));
    }
    else outTex.setRef(fb.getTextureColor());

    cgl.popShader();
    cgl.popViewPort();

    next.trigger();
};
