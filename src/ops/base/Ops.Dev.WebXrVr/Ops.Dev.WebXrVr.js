/*
https://web.dev/vr-comes-to-the-web-pt-ii/

*/

const
    outVr = op.outBoolNum("VR Support");

let xr = navigator.xr;

let hadError = false;
let buttonEle = null;
let xrSession = null;
let webGLRenContext = null;
let xrReferenceSpace = null;

// let offsetTransform = new XRRigidTransform({ "x": 2, "y": 0, "z": 1 }, { "x": 0, "y": 1, "z": 0, "w": 1 });

op.onDelete = removeButton;

const immersiveOK = navigator.xr.isSessionSupported("immersive-vr").then((r) =>
{
    if (r)initButton();
});

function startVr()
{
    xr.requestSession("immersive-vr").then((session) =>
    {
        xrSession = session;

        xrSession.requestReferenceSpace("local").then((refSpace) =>
        {
            xrReferenceSpace = refSpace;
        });

        if (xrSession)
        {
            let canvas = document.createElement("canvas");
            webGLRenContext = canvas.getContext("webgl2", { "xrCompatible": true });

            xrSession.updateRenderState({ "baseLayer": new XRWebGLLayer(xrSession, webGLRenContext) });

            console.log(xrSession);
            xrSession.requestAnimationFrame(onXRFrame);
        }

        outVr.set(true);
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

        // console.log(xrViewerPose);

        if (xrViewerPose)
        {
            let glLayer = xrSession.renderState.baseLayer;
            webGLRenContext.bindFramebuffer(webGLRenContext.FRAMEBUFFER, glLayer.framebuffer);
        }
    }
    catch (e)
    {
        console.log(e);
        hadError = true;
    }
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
