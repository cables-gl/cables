const
    exec = op.inTrigger("Render"),
    inShader = op.inObject("Shader", null, "shader"),
    inVPSize = op.inValueBool("Use Viewport Size", true),
    inWidth = op.inValueInt("Width", 512),
    inHeight = op.inValueInt("Height", 512),
    tfilter = op.inValueSelect("filter", ["nearest", "linear", "mipmap"]),
    twrap = op.inValueSelect("wrap", ["clamp to edge", "repeat", "mirrored repeat"], "clamp to edge"),
    inFloatingPoint = op.inValueBool("Floating Point", false),
    inNumTex = op.inSwitch("Num Textures", ["1", "4"], "1"),
    next = op.outTrigger("Next"),
    outTex = op.outTexture("Texture"),
    outTex2 = op.outTexture("Texture 2"),
    outTex3 = op.outTexture("Texture 3"),
    outTex4 = op.outTexture("Texture 4");

op.setPortGroup("Texture Size", [inVPSize, inWidth, inHeight]);
op.setPortGroup("Texture settings", [tfilter, twrap, inFloatingPoint]);

let numTextures = 1;
const cgl = op.patch.cgl;
const prevViewPort = [0, 0, 0, 0];
const effect = null;
const drawBuffArr = [];
let lastShader = null;
let shader = null;

inWidth.onChange =
    inHeight.onChange =
    inFloatingPoint.onChange =
    tfilter.onChange =
    inNumTex.onChange =
    twrap.onChange = initFbLater;

inVPSize.onChange = updateUI;

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
    if (tfilter.get() == "mipmap" && inFloatingPoint.get())
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
    inWidth.setUiAttribs({ "greyout": inVPSize.get() });
    inHeight.setUiAttribs({ "greyout": inVPSize.get() });

    inWidth.set(cgl.getViewPort()[2]);
    inHeight.set(cgl.getViewPort()[3]);
}

function initFbLater()
{
    needInit = true;
    warning();
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

    if (inVPSize.get())
    {
        w = cgl.getViewPort()[2];
        h = cgl.getViewPort()[3];
    }

    let filter = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "linear") filter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") filter = CGL.Texture.FILTER_MIPMAP;

    let selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
    if (twrap.get() == "repeat") selectedWrap = CGL.Texture.WRAP_REPEAT;
    if (twrap.get() == "mirrored repeat") selectedWrap = CGL.Texture.WRAP_MIRRORED_REPEAT;

    if (cgl.glVersion >= 2)
    {
        fb = new CGL.Framebuffer2(cgl, w, h,
            {
                "isFloatingPointTexture": inFloatingPoint.get(),
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
    const vp = cgl.getViewPort();

    if (!fb || needInit)initFb();
    if (inVPSize.get() && fb && (vp[2] != fb.getTextureColor().width || vp[3] != fb.getTextureColor().height)) initFb();

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

    prevViewPort[0] = vp[0];
    prevViewPort[1] = vp[1];
    prevViewPort[2] = vp[2];
    prevViewPort[3] = vp[3];

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
        outTex.set(fb.getTextureColorNum(0));
        outTex2.set(fb.getTextureColorNum(1));
        outTex3.set(fb.getTextureColorNum(2));
        outTex4.set(fb.getTextureColorNum(3));
    }
    else outTex.set(fb.getTextureColor());

    cgl.popShader();

    cgl.gl.viewport(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

    next.trigger();
};
