const
    next = op.outTrigger("Next"),
    hdpi = op.inFloat("HDPI max Density", 2),
    clear = op.inValueBool("Clear", true),
    clearAlpha = op.inValueBool("ClearAlpha", true),

    inEnabled = op.inBool("Active", true),
    width = op.outNumber("width"),
    height = op.outNumber("height");
let canvas = null;
let container = null;

canvas = document.createElement("canvas");
canvas.id = "webglcanvas";
canvas.setAttribute("tabindex", 4);
canvas.style.width = 128 + "px";
canvas.style.height = 128 + "px";
canvas.style.right = 0 + "px";
canvas.style["z-index"] = "22222";
canvas.style.borderTop = "3px solid red";
canvas.style.position = "absolute";
let rframes = 0;
let rframeStart = 0;
let canvasId = "cablescanvas";
let cgl = new CGL.Context(op.patch);
const identTranslate = vec3.create();
vec3.set(identTranslate, 0, 0, 0);
const identTranslateView = vec3.create();
vec3.set(identTranslateView, 0, 0, -2);

cgl.setCanvas(canvas);

container = document.getElementById(canvasId);

if (op.patch.config.glCanvasId)
{
    canvasId = op.patch.config.glCanvasId;
    container = document.getElementById(canvasId).parentElement;
}

container.appendChild(canvas);

if (CABLES.UI)
{
    gui.canvasManager.addContext(cgl);
    gui.canvasManager.setCurrentCanvas(cgl);
}

op.onAnimFrame = frame;
hdpi.onChange = updateHdpi;

updateHdpi();

function updateHdpi()
{
    op.patch.cgl.pixelDensity = Math.min(hdpi, window.devicePixelRatio);

    op.patch.cgl.updateSize();
    if (CABLES.UI) gui.setLayout();
}

function getFpsLimit()
{
    return 0;
}

function frame()
{
    if (!inEnabled.get()) return;
    if (cgl.aborted || cgl.canvas.clientWidth === 0 || cgl.canvas.clientHeight === 0) return;

    op.patch.cg = cgl;

    if (hdpi.get())op.patch.cgl.pixelDensity = window.devicePixelRatio;

    const startTime = performance.now();

    op.patch.config.fpsLimit = getFpsLimit();

    if (cgl.canvasWidth == -1)
    {
        cgl.setCanvas(op.patch.config.glCanvasId);
        return;
    }

    if (cgl.canvasWidth != width.get() || cgl.canvasHeight != height.get())
    {
        let div = 1;
        // if (inUnit.get() == "CSS")div = op.patch.cgl.pixelDensity;

        width.set(cgl.canvasWidth / div);
        height.set(cgl.canvasHeight / div);
    }

    if (CABLES.now() - rframeStart > 1000)
    {
        CGL.fpsReport = CGL.fpsReport || [];
        if (op.patch.loading.getProgress() >= 1.0 && rframeStart !== 0)CGL.fpsReport.push(rframes);
        rframes = 0;
        rframeStart = CABLES.now();
    }
    CGL.MESH.lastShader = null;
    CGL.MESH.lastMesh = null;

    cgl.renderStart(cgl, identTranslate, identTranslateView);

    if (clear.get())
    {
        cgl.gl.clearColor(0, 0, 0, 1);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    }

    next.trigger();

    if (CGL.MESH.lastMesh)CGL.MESH.lastMesh.unBind();

    if (CGL.Texture.previewTexture)
    {
        if (!CGL.Texture.texturePreviewer) CGL.Texture.texturePreviewer = new CGL.Texture.texturePreview(cgl);
        CGL.Texture.texturePreviewer.render(CGL.Texture.previewTexture);
    }
    cgl.renderEnd(cgl);

    op.patch.cg = null;

    if (clearAlpha.get())
    {
        cgl.gl.clearColor(1, 1, 1, 1);
        cgl.gl.colorMask(false, false, false, true);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT);
        cgl.gl.colorMask(true, true, true, true);
    }

    if (!cgl.frameStore.phong)cgl.frameStore.phong = {};
    rframes++;

    op.patch.cgl.profileData.profileMainloopMs = performance.now() - startTime;
}
