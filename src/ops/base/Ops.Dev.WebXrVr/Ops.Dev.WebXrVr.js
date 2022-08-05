/*
https://web.dev/vr-comes-to-the-web-pt-ii/

*/

const
    inMainloop = op.inTrigger("Mainloop"),
    inStop = op.inTriggerButton("Stop"),
    inButtonStyle = op.inStringEditor("Button Style", "padding:10px;\nposition:absolute;\nleft:50%;\ntop:50%;\nwidth:50px;\nheight:50px;\ncursor:pointer;\nborder-radius:40px;\nbackground:#444;\nbackground-repeat:no-repeat;\nbackground-size:70%;\nbackground-position:center center;\nz-index:9999;\nbackground-image:url(data:image/svg+xml," + attachments.icon_svg + ");"),
    next = op.outTrigger("Next"),
    nextPre = op.outTrigger("Render After Eyes"),
    outPose = op.outObject("Viewer Pose"),
    outVr = op.outBoolNum("VR Support"),
    outMat = op.outArray("Matrix"),
    outElement = op.outObject("DOM Overlay Ele", null, "element"),
    outSession = op.outBoolNum("In Session"),
    outMs = op.outArray("Ms per eye");

const cgl = op.patch.cgl;
const canvas = op.patch.cgl.canvas.parentElement;

let msEyes = [0, 0];
let xr = navigator.xr;

let hadError = false;
let buttonEle = null;
let glLayer = null;
let xrSession = null;
let webGLRenContext = null;
let xrReferenceSpace = null;
let vmat = mat4.create();
let xrViewerPose = null;

inStop.onTriggered = stopVr;
inButtonStyle.onChange = () => { if (buttonEle)buttonEle.style = inButtonStyle.get(); };

if (xr)
    xr.isSessionSupported("immersive-vr").then((r) =>
    {
        console.log("xr detected", r);
        if (r) initButton();
    });

op.onDelete = () =>
{
    removeButton();
};

function stopVr()
{
    if (xrSession)xrSession.end();
    xrSession = null;
    outSession.set(false);

    cgl.frameStore.xrSession = null;
    cgl.frameStore.xrFrame = null;
    cgl.frameStore.xrViewerPose = null;
    cgl.frameStore.xrReferenceSpace = null;
}

function startVr()
{
    if (xrSession)
    {
        stopVr();
        return;
    }

    xr.requestSession("immersive-vr", {}
    ).then(
        async (session) =>
        {
            xrSession = session;
            outSession.set(true);

            xrSession.requestReferenceSpace("local").then(
                (refSpace) =>
                {
                    xrReferenceSpace = refSpace;
                });

            if (xrSession)
            {
                outVr.set(true);

                console.log("started vr session....");

                await cgl.gl.makeXRCompatible();

                let canvas = cgl.canvas;
                webGLRenContext = canvas.getContext("webgl2", { "xrCompatible": false });

                xrSession.updateRenderState({ "baseLayer": new XRWebGLLayer(xrSession, webGLRenContext) });

                xrSession.requestAnimationFrame(onXRFrame);
            }
        },
        (err) =>
        {
            // error....
            console.log("Failed to start immersive AR session.");
            console.log(err);
        });
}

function onXRFrame(hrTime, xrFrame)
{
    if (hadError) return;

    let xrSession = xrFrame.session;
    xrSession.requestAnimationFrame(onXRFrame);

    try
    {
        xrViewerPose = xrFrame.getViewerPose(xrReferenceSpace);

        cgl.frameStore.xrSession = xrSession;
        cgl.frameStore.xrFrame = xrFrame;
        cgl.frameStore.xrViewerPose = xrViewerPose;
        cgl.frameStore.xrReferenceSpace = xrReferenceSpace;

        outMat.set(xrViewerPose.transform.matrix);

        outPose.set(null);
        outPose.set(xrViewerPose);

        if (xrViewerPose)
        {
            glLayer = xrSession.renderState.baseLayer;
            webGLRenContext.bindFramebuffer(webGLRenContext.FRAMEBUFFER, glLayer.framebuffer);
        }

        CABLES.patch.emitOnAnimFrameEvent();

        cgl.renderStart(cgl);

        cgl.gl.clearColor(0, 0, 0, 1);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

        for (let i = 0; i < xrViewerPose.views.length; i++)
        {
            let start = performance.now();
            renderPre();
            renderEye(xrViewerPose.views[i]);

            msEyes[i] = performance.now() - start;
        }

        if (CGL.MESH.lastMesh)CGL.MESH.lastMesh.unBind();

        nextPre.trigger();

        cgl.renderEnd(cgl);

        outMs.set(msEyes);

        CGL.MESH.lastShader = null;
        CGL.MESH.lastMesh = null;
    }
    catch (e)
    {
        console.error(e);
        hadError = true;
    }
}

inMainloop.onTriggered = () =>
{
    if (!xrSession)
    {
        next.trigger();
    }
};

function renderPre()
{
    cgl.pushDepthTest(true);
    cgl.pushDepthWrite(true);
    cgl.pushDepthFunc(cgl.gl.LEQUAL);

    CGL.MESH.lastShader = null;
    CGL.MESH.lastMesh = null;
}

function renderEye(view)
{
    cgl.pushBlend(true);
    cgl.gl.blendEquationSeparate(cgl.gl.FUNC_ADD, cgl.gl.FUNC_ADD);
    cgl.gl.blendFuncSeparate(cgl.gl.SRC_ALPHA, cgl.gl.ONE_MINUS_SRC_ALPHA, cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);

    cgl.pushPMatrix();

    cgl.pMatrix = view.projectionMatrix;

    cgl.pushViewMatrix();

    mat4.invert(cgl.vMatrix, xrViewerPose.transform.matrix);

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
    buttonEle.style = inButtonStyle.get();
    console.log("button ele");
}

function removeButton()
{
    if (buttonEle)buttonEle.remove();
}
