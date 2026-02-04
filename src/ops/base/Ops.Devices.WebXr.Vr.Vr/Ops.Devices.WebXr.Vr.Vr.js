const
    inMainloop = op.inTrigger("Mainloop"),
    inStart = op.inTriggerButton("Start"),
    inStop = op.inTriggerButton("Stop"),
    inImmersion = op.inSwitch("Immersion", ["VR", "AR"], "VR"),
    inShowButton = op.inBool("Show Button", true),
    inButtonStyle = op.inStringEditor("Button Style", "padding:10px;\nposition:absolute;\nleft:50%;\ntop:50%;\ntransform: translate(-50%,-50%);\nwidth:50px;\nheight:50px;\ncursor:pointer;\nborder-radius:40px;\nbackground:#444;\nbackground-repeat:no-repeat;\nbackground-size:70%;\nbackground-position:center center;\nz-index:9999;\nbackground-image:url(data:image/svg+xml," + attachments.icon_svg + ");", "inline-css"),
    inRender2Tex = op.inBool("Render to texture", false),
    inShader = op.inObject("Shader", null, "shader"),
    msaa = op.inSwitch("MSAA", ["none", "2x", "4x", "8x"], "none"),
    next = op.outTrigger("Next"),
    nextPre = op.outTrigger("Render After Eyes"),
    outPose = op.outObject("Viewer Pose"),
    outEyeIndex = op.outNumber("Eye Index"),
    outHasLocalFloor = op.outBoolNum("Local Floor Ref"),
    outVr = op.outBoolNum("VR Support"),
    outMat = op.outArray("Matrix"),
    outSession = op.outBoolNum("In Session"),
    outMs = op.outArray("Ms per eye"),
    outTex = op.outTexture("Texture"),
    outDepth = op.outTexture("Texture Depth");

const cgl = op.patch.cgl;
const canvas = op.patch.cgl.canvas.parentElement;

op.setPortGroup("Startbutton", [inButtonStyle, inShowButton]);
op.setPortGroup("Texture", [inRender2Tex, msaa]);

let msEyes = [0, 0];
const xr = navigator.xr;
let fb = null;
let hadError = false;
let buttonEle = null;
let glLayer = null;
let xrSession = null;
let webGLRenContext = null;
let refSpaceLocal = null;
let refSpaceLocalFloor = null;

let xrViewerPose = null;
let geom = new CGL.Geometry("webxr final texture draw rectangle");
let mesh = null;
const shader = new CGL.Shader(cgl, "vr rect");
shader.fullscreenRectUniform = new CGL.Uniform(shader, "t", "tex", 0);
shader.setSource(attachments.present_vert, attachments.present_frag);

inStart.onTriggered = startVr;
inStop.onTriggered = stopVr;
inButtonStyle.onChange = () => { if (buttonEle)buttonEle.style = inButtonStyle.get(); };

const overlayEle = op.patch.getDocument().createElement("div");
// overlayEle.style.background = "rgba(0,0,0,0)";
// overlayEle.style.position = "absolute";
// overlayEle.style.top = "0";
// overlayEle.style.bottom = "0";
// overlayEle.style.left = "0";
// overlayEle.style.right = "0";
// overlayEle.style.display = "none";
// overlayEle.style.contain = "paint !important";

outElement.setRef(overlayEle);
document.body.appendChild(overlayEle);

if (xr) xr.isSessionSupported("immersive-" + inImmersion.get().toLowerCase()).then(
    (r) =>
    {
        outVr.set(true);

        if (r) initButton();
        else removeButton();
    });
else removeButton();

op.onDelete = () =>
{
    removeButton();
};

inShowButton.onChange = () =>
{
    if (!inShowButton.get())removeButton();
    else initButton();
};

function stopVr()
{
    if (xrSession)xrSession.end();
    xrSession = null;
    outSession.set(false);

    cgl.tempData.xrSession = null;
    cgl.tempData.xrFrame = null;
    cgl.tempData.xrViewerPose = null;
    cgl.tempData.xrReferenceSpace = null;
}

function startVr()
{
    if (xrSession)
    {
        stopVr();
        return;
    }

    xr.requestSession(
        "immersive-" + inImmersion.get().toLowerCase(),
        {
            "optionalFeatures": ["hand-tracking", "local-floor", "dom-overlay"],
            "domOverlay": { "root": overlayEle }
        }
    ).then(
        async (session) =>
        {
            xrSession = session;
            outSession.set(true);

            xrSession.requestReferenceSpace("local").then(
                (refSpace) =>
                {
                    refSpaceLocal = refSpace;
                });

            xrSession.requestReferenceSpace("local-floor").then(
                (refSpace) =>
                {
                    refSpaceLocalFloor = refSpace;
                    outHasLocalFloor.set(true);
                });

            if (xrSession)
            {
                await cgl.gl.makeXRCompatible();

                let canvas = cgl.canvas;
                webGLRenContext = canvas.getContext("webgl2", { "xrCompatible": true });

                xrSession.updateRenderState({ "baseLayer": new XRWebGLLayer(xrSession, webGLRenContext) });
                xrSession.requestAnimationFrame(onXRFrame);

                overlayEle.style.display = "block";

                console.log("enabledFeatures", xrSession.enabledFeatures);
            }
        },
        (err) =>
        {
            // error....
            op.error(err);
        });
}

function onXRFrame(hrTime, xrFrame)
{
    if (hadError) return;

    let xrSession = xrFrame.session;
    xrSession.requestAnimationFrame(onXRFrame);

    try
    {
        xrViewerPose = xrFrame.getViewerPose(refSpaceLocalFloor || refSpaceLocal);

        cgl.tempData.xrSession = xrSession;
        cgl.tempData.xrFrame = xrFrame;
        cgl.tempData.xrViewerPose = xrViewerPose;

        if (refSpaceLocalFloor) cgl.tempData.xrReferenceSpace = refSpaceLocalFloor;
        else cgl.tempData.xrReferenceSpace = refSpaceLocal;

        if (xrViewerPose) outMat.set(xrViewerPose.transform.matrix);

        outPose.setRef(xrViewerPose);

        if (xrViewerPose)
        {
            glLayer = xrSession.renderState.baseLayer;
            webGLRenContext.bindFramebuffer(webGLRenContext.FRAMEBUFFER, glLayer.framebuffer);
        }

        op.patch.updateAnims();

        cgl.renderStart(cgl);

        if (inRender2Tex.get()) r2texStart();

        if (inImmersion.get() == "VR") cgl.gl.clearColor(0, 0, 0, 1);
        else cgl.gl.clearColor(0, 0, 0, 0);

        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

        op.patch.cg = cgl;

        const views = xrViewerPose ? xrViewerPose.views : [];
        for (let i = 0; i < views.length; i++)
        {
            let start = performance.now();
            outEyeIndex.set(i);
            renderPre();
            renderEye(xrViewerPose.views[i]);

            msEyes[i] = performance.now() - start;
            renderPost();

            if (CGL.MESH.lastMesh)CGL.MESH.lastMesh.unBind();
        }

        if (CGL.MESH.lastMesh)CGL.MESH.lastMesh.unBind();

        if (inRender2Tex.get()) r2texEnd();

        cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, glLayer.framebuffer); // gllayer has a default framebuffer.... interferes with cables fb stack...

        nextPre.trigger();

        if (inRender2Tex.get())
        {
            cgl.gl.clearColor(0, 0, 1, 1);
            cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

            cgl.pushPMatrix();
            cgl.pushViewMatrix();

            mat4.ortho(cgl.pMatrix, 0, glLayer.framebufferWidth, glLayer.framebufferHeight, 0, -10, 10);
            cgl.gl.viewport(0, 0, glLayer.framebufferWidth, glLayer.framebufferHeight);

            if (!mesh)rebuildRectangle();

            cgl.setTexture(0, outTex.get().tex);

            if (inShader.isLinked())mesh.render(inShader.get());
            else mesh.render(shader);

            cgl.popPMatrix();
            cgl.popViewMatrix();
        }

        cgl.renderEnd(cgl);

        outMs.setRef(msEyes);

        CGL.MESH.lastShader = null;
        CGL.MESH.lastMesh = null;
        op.patch.cg = null;
    }
    catch (e)
    {
        op.error(e);
        hadError = true;
    }
}

inMainloop.onTriggered = () =>
{
    if (!xrSession) next.trigger();
};

function renderPre()
{
    cgl.pushDepthTest(true);
    cgl.pushDepthWrite(true);
    cgl.pushDepthFunc(cgl.gl.LEQUAL);

    CGL.MESH.lastShader = null;
    CGL.MESH.lastMesh = null;
}

function renderPost()
{
    cgl.popDepthTest();
    cgl.popDepthWrite();
    cgl.popDepthFunc();
}

function renderEye(view)
{
    cgl.pushBlend(true);
    cgl.gl.blendEquationSeparate(cgl.gl.FUNC_ADD, cgl.gl.FUNC_ADD);
    cgl.gl.blendFuncSeparate(cgl.gl.SRC_ALPHA, cgl.gl.ONE_MINUS_SRC_ALPHA, cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);

    cgl.pushPMatrix();

    cgl.pMatrix = view.projectionMatrix;

    cgl.pushViewMatrix();

    mat4.invert(cgl.vMatrix, view.transform.matrix);

    let viewport = glLayer.getViewport(view);
    cgl.gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

    next.trigger();

    cgl.popViewMatrix();
    cgl.popPMatrix();
    cgl.popBlend();
}

function initButton()
{
    if (buttonEle)
    {
        removeButton();
        buttonEle = null;
    }

    buttonEle = document.createElement("div");
    let container = op.patch.cgl.canvas.parentElement;
    if (container)container.appendChild(buttonEle);
    buttonEle.addEventListener("click", startVr);
    buttonEle.addEventListener("touchstart", startVr);
    buttonEle.style = inButtonStyle.get();
}

function removeButton()
{
    if (buttonEle)buttonEle.remove();
}

msaa.onChange = () =>
{
    if (fb) fb.delete();
    fb = null;
};

function r2texStart()
{
    const w = glLayer.framebufferWidth;
    const h = glLayer.framebufferHeight;

    if (!fb)
    {
        if (fb) fb.delete();

        let selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
        let selectFilter = CGL.Texture.FILTER_NEAREST;

        let ms = true;
        let msSamples = 4;

        if (msaa.get() == "none")
        {
            msSamples = 0;
            ms = false;
        }
        if (msaa.get() == "2x") msSamples = 2;
        if (msaa.get() == "4x") msSamples = 4;
        if (msaa.get() == "8x") msSamples = 8;

        fb = new CGL.Framebuffer2(cgl, w, h, {
            "name": "render2texture " + op.id,
            "isFloatingPointTexture": false,
            "multisampling": ms,
            "wrap": selectedWrap,
            "filter": selectFilter,
            "depth": true,
            "multisamplingSamples": msSamples,
            "clear": true
        });

        outDepth.set(fb.getTextureDepth());
    }

    if (fb.getWidth() != Math.ceil(w) || fb.getHeight() != Math.ceil(h)) fb.setSize(w, h);

    fb.renderStart(cgl);
}

function r2texEnd()
{
    fb.renderEnd(cgl);

    outTex.set(CGL.Texture.getEmptyTexture(op.patch.cgl));
    outTex.set(fb.getTextureColor());
}

function rebuildRectangle()
{
    let xx = 0, xy = 0;

    const w = glLayer.framebufferWidth;
    const h = glLayer.framebufferHeight;

    geom.vertices = new Float32Array([
        xx + w, xy + h, 0,
        xx, xy + h, 0,
        xx + w, xy, 0,
        xx, xy, 0
    ]);

    let tc = null;

    tc = new Float32Array([
        1.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
    ]);

    geom.setTexCoords(tc);

    geom.verticesIndices = new Uint16Array([2, 1, 0, 3, 1, 2]);
    geom.vertexNormals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
    geom.tangents = new Float32Array([-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0]);
    geom.biTangents = new Float32Array([0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0]);

    if (!mesh) mesh = new CGL.Mesh(cgl, geom);
    else mesh.setGeom(geom);
}
