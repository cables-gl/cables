const
    exec = op.inTrigger("Render"),
    inShader = op.inObject("Shader"),
    inVPSize = op.inValueBool("Use Viewport Size", true),
    inWidth = op.inValueInt("Width", 512),
    inHeight = op.inValueInt("Height", 512),
    tfilter = op.inValueSelect("filter", ["nearest", "linear", "mipmap"]),
    twrap = op.inValueSelect("wrap", ["clamp to edge", "repeat", "mirrored repeat"], "clamp to edge"),
    inFloatingPoint = op.inValueBool("Floating Point", false),
    next = op.outTrigger("Next"),
    outTex = op.outTexture("Texture");

op.setPortGroup("Texture Size", [inVPSize, inWidth, inHeight]);
op.setPortGroup("Texture settings", [tfilter, twrap, inFloatingPoint]);

const cgl = op.patch.cgl;
const prevViewPort = [0, 0, 0, 0];
const effect = null;

inWidth.onChange =
    inHeight.onChange =
    inFloatingPoint.onChange =
    tfilter.onChange =
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
    op.log("bool checked");
    if (inVPSize.get() === true)
    {
        inWidth.setUiAttribs({ "greyout": true });
        inHeight.setUiAttribs({ "greyout": true });
        inWidth.set(cgl.getViewPort()[2]);
        inHeight.set(cgl.getViewPort()[3]);
    }
    else if (inVPSize.get() === false)
    {
        inWidth.setUiAttribs({ "greyout": false });
        inHeight.setUiAttribs({ "greyout": false });
    }
}

function initFbLater()
{
    needInit = true;
    warning();
}

function initFb()
{
    needInit = false;
    if (fb)fb.delete();
    fb = null;

    const w = inWidth.get();
    const h = inHeight.get();

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

    const shader = inShader.get();
    if (!shader)
    {
        outTex.set(null);
        return;
    }
    if (!fb || needInit)initFb();
    if (inVPSize.get() && fb && (vp[2] != fb.getTextureColor().width || vp[3] != fb.getTextureColor().height))
    {
        initFb();
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

    mesh.render(inShader.get());

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();
    fb.renderEnd(cgl);

    outTex.set(fb.getTextureColor());

    cgl.popShader();

    cgl.gl.viewport(prevViewPort[0], prevViewPort[1], prevViewPort[2], prevViewPort[3]);

    next.trigger();
};
