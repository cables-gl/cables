let inStartVr = op.inTriggerButton("Start VR");
let inStopVr = op.inTriggerButton("Stop VR");

let inResMul = op.inValueSlider("Scale Resolution", 1);

let inResizeCancas = op.inValueBool("Resize Canvas", false);

let nextVr = op.outTrigger("VR Mainloop");
let nextNonVr = op.outTrigger("NoVR Mainloop");

// width and height, needed for raycasting to raycaster ?
const width = op.outValue("width");
const height = op.outValue("height");

// headset or mobile data
let outSupported = op.outValue("Supported");
let outControllerSupport = op.outValue("Controller support");
let outTotalControllers = op.outValue("Controllers amount");
let outDisplayName = op.outValue("VR Display");

// eyes
let outFps = op.outValue("FPS");
let outEye = op.outValue("Eye");

// controllers
let outGamePadLeft = op.outObject("Gamepad object Left");
let outGamePadRight = op.outObject("Gamepad object Right");

// single trigger for now with things like average interpolation
let singleTrigger = op.outTrigger("single trigger out");
let useGamepads = op.inValueBool("use gamepads", false);

let outPMatrix = op.outArray("Left PMatrix");

const outStarted = op.outValueBool("Started VR", false);
let buttonEle = null;

const cgl = op.patch.cgl;
let vrDisplay = null;
let zero = vec3.create();
let frameCount = 0;
let frameLast = 0;
let frameData = null;
let initialRun = true;

let polyfill = null;
if (window.WebVRPolyfill)polyfill = new WebVRPolyfill({ "BUFFER_SCALE": 0.5 });

op.onDelete = function ()
{
    stopVr();
    if (buttonEle)removeButton();
    op.log("deleted");
};
inStopVr.onTriggered = stopVr;

let leftEye, rightEye;

let identTranslate = vec3.create();
vec3.set(identTranslate, 0, 0, 0);
let identTranslateView = vec3.create();
vec3.set(identTranslateView, 0, 0, -2);

requestAnimationFrame(renderNoVr);

let started = false;
inStartVr.onTriggered = startVr;

if (navigator.getVRDisplays)
{
    outSupported.set(true);
    navigator.getVRDisplays().then(function (displays)
    {
        // If a display is available, use it to present the scene
        if (displays.length > 0)
        {
            vrDisplay = displays[0];
            outDisplayName.set(vrDisplay.displayName);
            op.log("Display found", vrDisplay.displayName);
        }

        if (navigator.getVRDisplays && navigator.getGamepads)
        {
            op.log("WebVR API and Gamepad API supported.");
            outControllerSupport.set(true);

            reportDisplays();// leave for now
        }
        else
        {
            op.logError("could not find vr display...");
        }
    });
}
else
{
    outSupported.set(false);
}

if (outSupported.get())initButton();

function removeButton()
{
    if (buttonEle && buttonEle.parentNode)buttonEle.parentNode.removeChild(buttonEle);
    buttonEle = null;
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
    buttonEle.style.right = "25px";
    buttonEle.style.top = "25px";
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

function renderNoVr()
{
    if (started) return;

    width.set(cgl.canvasWidth);
    height.set(cgl.canvasHeight);

    cgl.setViewPort(0, 0, cgl.canvasWidth, cgl.canvasHeight);

    mat4.perspective(cgl.pMatrix, 45, cgl.canvasWidth / cgl.canvasHeight, 0.01, 100.0);

    cgl.pushViewMatrix();
    cgl.pushModelMatrix();

    mat4.identity(cgl.mMatrix);
    mat4.identity(cgl.vMatrix);
    mat4.translate(cgl.mMatrix, cgl.mMatrix, identTranslate);
    mat4.translate(cgl.vMatrix, cgl.vMatrix, identTranslateView);

    renderPre();
    renderEye(0);

    mat4.identity(cgl.pMatrix);
    cgl.popModelMatrix();
    cgl.popViewMatrix();

    requestAnimationFrame(renderNoVr);
}

function startVr()
{
    stopVr();
    outStarted.set(false);

    op.patch.cgl.pixelDensity = window.devicePixelRatio;
    op.patch.cgl.updateSize();
    if (CABLES.UI) gui.setLayout();

    vrDisplay.requestPresent([{ "source": cgl.canvas }]).then(
        function ()
        {
            op.log("Presenting to WebVR display");
            leftEye = vrDisplay.getEyeParameters("left");
            rightEye = vrDisplay.getEyeParameters("right");
            frameData = new VRFrameData();
            vrDisplay.requestAnimationFrame(mainloopVr);
            started = true;
            if (buttonEle)removeButton();
        });
}

function stopVr()
{
    if (vrDisplay)
    {
        vrDisplay.exitPresent();
        op.log("Stopped presenting to WebVR display");
        vrDisplay.cancelAnimationFrame(mainloopVr);
    }
    outStarted.set(false);
    started = false;

    renderNoVr();
}

function mainloopVr()
{
    if (!started) return;
    // get width and height, maybe need to divide by 2 ?
    if (cgl.aborted || cgl.canvas.clientWidth === 0 || cgl.canvas.clientHeight === 0) return;

    mat4.identity(cgl.pMatrix);
    mat4.identity(cgl.vMatrix);

    if (!cgl.canvas && cgl.canvasWidth == -1)
    {
        cgl.setCanvas(op.patch.config.glCanvasId);
        return;
    }

    if (inResizeCancas.get())
    {
        cgl.canvas.style.width = leftEye.renderWidth * 2;
        cgl.canvas.style.height = leftEye.renderHeight;

        width.set(leftEye.renderWidth);
        height.set(leftEye.renderHeight);

        cgl.updateSize();
        if (gui)
        {
            gui.rendererWidth = leftEye.renderWidth * 2;
            gui.rendererHeight = leftEye.renderHeight;
            gui.setLayout();
        }
    }
    else
    {
        width.set(cgl.canvasWidth);
        height.set(cgl.canvasHeight);
    }

    // VR stuff
    let vrSceneFrame = vrDisplay.requestAnimationFrame(mainloopVr);

    vrDisplay.getFrameData(frameData);

    if (useGamepads.get())
    {
        let gamepads = navigator.getGamepads();
        gamePadsOut(gamepads);
    }

    if (CABLES.now() - frameLast > 1000)
    {
        outFps.set(frameCount);
        frameCount = 0;
        frameLast = CABLES.now();
    }

    renderPre();
    renderEye(0);

    cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);

    renderEye(1);

    vrDisplay.submitFrame();

    frameCount++;

    singleTrigger.trigger();
}

function renderPre()
{
    cgl.pushDepthTest(true);
    cgl.pushDepthWrite(true);
    cgl.pushDepthFunc(cgl.gl.LEQUAL);

    // cgl.renderStart(cgl,zero,zero);

    CGL.MESH.lastShader = null;
    CGL.MESH.lastMesh = null;
}

function renderPost()
{
    cgl.popViewMatrix();
    cgl.popPMatrix();
    // cgl.popBlend(true);
}

function renderEye(which)
{
    outEye.set(which);

    cgl.pushBlend(true);
    cgl.gl.blendEquationSeparate(cgl.gl.FUNC_ADD, cgl.gl.FUNC_ADD);
    cgl.gl.blendFuncSeparate(cgl.gl.SRC_ALPHA, cgl.gl.ONE_MINUS_SRC_ALPHA, cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);

    if (which == 0)
    {
        cgl.gl.clearColor(0, 0, 0, 1);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    }

    // left eye

    cgl.pushPMatrix();

    if (!started)
    {

    }
    // else if(which==0) mat4.multiply(cgl.pMatrix,cgl.pMatrix,frameData.leftProjectionMatrix);
    // else if(which==1) mat4.multiply(cgl.pMatrix,cgl.pMatrix,frameData.rightProjectionMatrix);
    else if (which == 0)
    {
        cgl.pMatrix = frameData.leftProjectionMatrix;
        outPMatrix.set(frameData.leftProjectionMatrix);
    }
    else if (which == 1)cgl.pMatrix = frameData.rightProjectionMatrix;

    cgl.pushViewMatrix();

    mat4.identity(cgl.vMatrix);

    if (!frameData)
    {

    }
    else if (which == 0) cgl.vMatrix = frameData.leftViewMatrix;
    else if (which == 1) cgl.vMatrix = frameData.rightViewMatrix;

    if (!started)
    {

    }
    else if (which == 1) cgl.setViewPort(cgl.canvasWidth * 0.5, 0, cgl.canvasWidth * 0.5, cgl.canvasHeight);
    else if (which == 0) cgl.setViewPort(0, 0, cgl.canvasWidth * 0.5, cgl.canvasHeight);

    if (started)nextVr.trigger();
    else nextNonVr.trigger();

    cgl.popViewMatrix();
    cgl.popPMatrix();
}

function reportDisplays()
{
    navigator.getVRDisplays().then(function (displays)
    {
        op.log(displays.length + " displays");

        for (let i = 0; i < displays.length; i++)
        {
            let cap = displays[i].capabilities;
            // cap is a VRDisplayCapabilities object

            op.log("Display " + (i + 1) + "\n"
                  + "VR Display ID: " + displays[i].displayId + "\n"
                  + "VR Display Name: " + displays[i].displayName + "\n"
                  + "Display can present content: " + cap.canPresent + "\n"
                  + "Display is separate from the computer's main display: " + cap.hasExternalDisplay + "\n"
                  + "Display can return position info: " + cap.hasPosition + "\n"
                  + "Display can return orientation info: " + cap.hasOrientation + "\n"
                  + "Display max layers: " + cap.maxLayers);
        }
        // For VR, controllers will only be active after their corresponding headset is active
        setTimeout(reportGamepads, 500);
    });
}

function gamePadsOut(gamepads)
{
    outGamePadLeft.set(null);
    // if(gamepads.length>0)
    outGamePadLeft.set(gamepads[0]);
    outGamePadRight.set(null);
    outGamePadRight.set(gamepads[1]);
    outTotalControllers.set(gamepads.length);
}

function reportGamepads()
{
    // //report total controllers connected
    // outTotalControllers.set(gamepads.length);
    // //if(gamepads.length ===0) op.log("No controllers are connected !");
    // for(var i = 0; i < gamepads.length; ++i)
    // {
    //     var gp = gamepads[i];
    //     if(!gp)continue;

    //     op.log('Gamepad ' + gp.index + '(' + gp.id + ')' + "'\n"
    //              + 'Associated with VR Display ID: ' + gp.displayId + "'\n"
    //              + 'Gamepad associated with which hand: ' + gp.hand + "'\n"
    //              + 'Available haptic actuators: ' + gp.hapticActuators.length + "'\n"
    //              + 'Gamepad can return position info: ' + gp.pose.hasPosition + "'\n"
    //              + 'Gamepad can return orientation info: ' + gp.pose.hasOrientation);
    // }
    // initialRun = false;
}
