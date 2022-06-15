/*
https://web.dev/vr-comes-to-the-web-pt-ii/

*/

const
    inStop = op.inTriggerButton("Stop"),
    next = op.outTrigger("Next"),
    outPose = op.outObject("Viewer Pose"),
    outVr = op.outBoolNum("VR Support"),
    outMat = op.outArray("Matrix"),
    outSession = op.outBoolNum("In Session");

const cgl = op.patch.cgl;
let xr = navigator.xr;

let hadError = false;
let buttonEle = null;
let glLayer = null;
let xrSession = null;
let webGLRenContext = null;
let xrReferenceSpace = null;

op.onDelete = removeButton;

const immersiveOK = navigator.xr.isSessionSupported("immersive-vr").then((r) =>
{
    if (r)initButton();
});

inStop.onTriggered = () =>
{
    if (xrSession)xrSession.end();
    outSession.set(false);
};

function startVr()
{
    xr.requestSession("immersive-vr").then((session) =>
    {
        xrSession = session;
        outSession.set(true);

        xrSession.requestReferenceSpace("local").then((refSpace) =>
        {
            xrReferenceSpace = refSpace;
        });

        if (xrSession)
        {
            outVr.set(true);

            // let canvas = document.createElement("canvas");
            let canvas = cgl.canvas;
            webGLRenContext = canvas.getContext("webgl2", { "xrCompatible": true });

            xrSession.updateRenderState({ "baseLayer": new XRWebGLLayer(xrSession, webGLRenContext) });

            // console.log(xrSession);
            xrSession.requestAnimationFrame(onXRFrame);
        }
    });
}

function onXRFrame(hrTime, xrFrame)
{
    if (hadError) return;

    let xrSession = xrFrame.session;
    xrSession.requestAnimationFrame(onXRFrame);

    try
    {
        let xrViewerPose = xrFrame.getViewerPose(xrReferenceSpace);

        // console.log(xrViewerPose.transform.matrix);
        outMat.set(xrViewerPose.transform.matrix);

        outPose.set(null);
        outPose.set(xrViewerPose);

        if (xrViewerPose)
        {
            glLayer = xrSession.renderState.baseLayer;
            webGLRenContext.bindFramebuffer(webGLRenContext.FRAMEBUFFER, glLayer.framebuffer);
        }

        cgl.gl.clearColor(0, 0, 0, 1);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

        for (let i = 0; i < xrViewerPose.views.length; i++)
        {
            renderPre();
            renderEye(xrViewerPose.views[i]);
        }
    }
    catch (e)
    {
        console.log(e);
        hadError = true;
    }
}

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
    cgl.popViewMatrix();
    cgl.popPMatrix();
}

function renderEye(view)
{
    cgl.pushBlend(true);
    cgl.gl.blendEquationSeparate(cgl.gl.FUNC_ADD, cgl.gl.FUNC_ADD);
    cgl.gl.blendFuncSeparate(cgl.gl.SRC_ALPHA, cgl.gl.ONE_MINUS_SRC_ALPHA, cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);

    cgl.pushPMatrix();

    cgl.pMatrix = view.projectionMatrix;

    cgl.pushViewMatrix();

    mat4.identity(cgl.vMatrix);

    let viewport = glLayer.getViewport(view);
    cgl.gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

    next.trigger();

    cgl.popViewMatrix();
    cgl.popPMatrix();
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

    buttonEle.style.padding = "10px";
    buttonEle.style.position = "absolute";
    buttonEle.style.left = "50%";
    buttonEle.style.top = "50%";
    buttonEle.style.width = "50px";
    buttonEle.style.height = "50px";
    buttonEle.style.cursor = "pointer";
    buttonEle.style["border-radius"] = "40px";
    buttonEle.style.background = "#444";
    buttonEle.style["background-repeat"] = "no-repeat";
    buttonEle.style["background-size"] = "70%";
    buttonEle.style["background-position"] = "center center";
    buttonEle.style["z-index"] = "9999";
    buttonEle.style["background-image"] = "url(data:image/svg+xml," + attachments.icon_svg + ")";
}

function removeButton()
{
    if (buttonEle)buttonEle.remove();
}
