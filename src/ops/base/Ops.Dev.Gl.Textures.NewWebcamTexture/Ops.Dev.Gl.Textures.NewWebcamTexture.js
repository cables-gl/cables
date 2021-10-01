const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

const
    inTrigger = op.inTrigger("Render"),
    inStart = op.inTriggerButton("Start webcam"),
    inActive = op.inValueBool("Generate Texture", true),
    inInputDevices = op.inDropDown("Webcam Input", ["None"]),
    inFacing = op.inSwitch("Facing", ["environment", "user"], "environment"),
    inWidth = op.inValueInt("Requested Width", 640),
    inHeight = op.inValueInt("Requested Height", 480),

    flip = op.inValueBool("Flip", false),

    inAsDOM = op.inValueBool("Show HTML Element", false),
    textureOut = op.outTexture("Texture"),
    inCss = op.inStringEditor("CSS", "z-index:99999;position:absolute;"),
    htmlFlipX = op.inValueBool("Flip X", false),
    htmlFlipY = op.inValueBool("Flip Y", false),

    outRatio = op.outNumber("Ratio"),
    available = op.outBool("Available"),
    outWidth = op.outNumber("Size Width"),
    outHeight = op.outNumber("Size Height"),
    outError = op.outString("Error"),
    outElement = op.outObject("HTML Element"),
    outDevices = op.outArray("Available devices"),
    outSelectedDevice = op.outString("Select device"),
    outUpdate = op.outTrigger("Texture updated");

op.setPortGroup("Camera", [inInputDevices, inFacing, inWidth, inHeight]);
op.setPortGroup("Texture", [flip]);
op.setPortGroup("Video Element", [inAsDOM, inCss, htmlFlipX, htmlFlipY]);

inWidth.onChange = inHeight.onChange = restartWebcam;
inFacing.onChange = inInputDevices.onChange = startWebcam;

htmlFlipX.onChange = htmlFlipY.onChange = flipVideoElement;

const cgl = op.patch.cgl;
const videoElement = document.createElement("video");
const eleId = "webcam" + op.id;
videoElement.setAttribute("id", eleId);
videoElement.setAttribute("autoplay", "");
videoElement.setAttribute("muted", "");
videoElement.setAttribute("playsinline", "");
videoElement.setAttribute("style", inCss.get());
op.patch.cgl.canvas.parentElement.appendChild(videoElement);

const emptyTexture = CGL.Texture.getEmptyTexture(cgl);
let tex = emptyTexture;
textureOut.set(tex);

let started = false;
let camLoaded = false;
let loadingId = null;
let currentStream = null;
let camInputDevices = null;
let active = false;
let alreadyRetried = false;

op.onDelete = removeElement;
inAsDOM.onChange = inCss.onChange = updateStyle;

updateStyle();

function removeElement()
{
    if (videoElement) videoElement.remove();
}

function updateStyle()
{
    if (!inAsDOM.get())
        videoElement.setAttribute("style", "display:none;");
    else
        videoElement.setAttribute("style", inCss.get());
}

function flipVideoElement()
{
    if (htmlFlipX.get() && !htmlFlipY.get())
    {
        videoElement.style.transform = "scaleX(-1)";
    }
    else if (!htmlFlipX.get() && htmlFlipY.get())
    {
        videoElement.style.transform = "scaleY(-1)";
    }
    else if (htmlFlipX.get() && htmlFlipY.get())
    {
        videoElement.style.transform = "scale(-1, -1)";
    }
    else
    {
        videoElement.style.transform = "unset";
    }
}

function playCam(shouldPlay)
{
    if (started && camLoaded)
    {
        if (shouldPlay)
        {
            active = true;
            videoElement.play();
        }
        else
        {
            active = false;
            videoElement.pause();
        }
    }
}

inActive.onChange = () =>
{
    playCam(inActive.get());
};

function updateTexture()
{
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex.tex);
    cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, !flip.get());

    cgl.gl.texImage2D(cgl.gl.TEXTURE_2D, 0, cgl.gl.RGBA, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, videoElement);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);
    textureOut.set(tex);
}

function stopStream()
{
    if (!currentStream)
        return;

    playCam(false);
    available.set(false);

    currentStream.getTracks().forEach((track) =>
    {
        track.stop();
    });
    currentStream = null;
}

function camInitComplete(stream)
{
    currentStream = stream;
    videoElement.srcObject = stream;
    videoElement.onloadedmetadata = (e) =>
    {
        outHeight.set(videoElement.videoHeight);
        outWidth.set(videoElement.videoWidth);
        outRatio.set(videoElement.videoWidth / videoElement.videoHeight);
        outError.set("");

        outElement.set(videoElement);

        tex.videoElement = videoElement;
        tex.setSize(videoElement.videoWidth, videoElement.videoHeight);

        available.set(true);
        playCam(inActive.get());
    };
}

function isCorrectSize()
{
    const constraints = getCamConstraints();
    const check = constraints.video.width == videoElement.videoWidth && constraints.video.height == videoElement.videoHeight;
    return check;
}

function getCamConstraints()
{
    let constraints = { "audio": false, "video": {} };

    if (camLoaded)
    {
        let deviceLabel = inInputDevices.get();
        let deviceInfo = null;
        if (!deviceLabel || deviceLabel === "None")
        {
            op.log("USE FIRST CAMERA");
            deviceInfo = Object.values(camInputDevices)[0]; // get first camera
        }
        else
        {
            op.log("FIND BY LABEL", deviceInfo, camInputDevices, deviceLabel);
            // Find by label
            deviceInfo = camInputDevices.filter((d) => d.label === deviceLabel);
            if (deviceInfo)
            {
                deviceInfo = deviceInfo[0];
            }
            else
            { // otherwise get by number
                deviceInfo = Object.values(camInputDevices)[deviceLabel];
            }

            if (!deviceInfo)
            { // couldn't find, default
                deviceInfo = Object.values(camInputDevices)[0]; // get first camera
                // console.log('couldnt find camera, revert to cam 0',  deviceInfo);
            }
        }
        outSelectedDevice.set(deviceInfo.label);
        constraints.video = { "deviceId": { "exact": deviceInfo.deviceId } };
    }
    else
    {
        op.log("NO CAM LOADED");
        outSelectedDevice.set("");
    }

    console.log("supported", navigator.mediaDevices.getSupportedConstraints());
    constraints.video.facingMode = inFacing.get();
    const w = inWidth.get();
    const h = inHeight.get();
    let width = {
        "min": DEFAULT_WIDTH
    };
    let height = {
        "min": DEFAULT_HEIGHT
    };

    if (w)
    {
        width.ideal = w;
    }

    if (h)
    {
        height.ideal = h;
    }

    constraints.video.width = width;
    constraints.video.height = height;
    console.log("CONSTRAINTS", JSON.stringify(constraints));
    return constraints;
}

function restartWebcam()
{
    stopStream();

    const constraints = getCamConstraints();

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(camInitComplete)
            .catch((error) =>
            {
                op.error(error.name + ": " + error.message, error);
                outError.set(error.name + ": " + error.message);
            });
    }
    else if (navigator.getUserMedia)
    {
        navigator.getUserMedia(constraints, camInitComplete, () => available.set(false));
    }
}

function startWebcam()
{
    if (!started || !camLoaded)
    {
        return;
    }

    restartWebcam();
}

function initDevices()
{
    loadingId = cgl.patch.loading.start("Webcam inputs", "");
    const constraints = getCamConstraints();

    navigator.mediaDevices.getUserMedia(constraints)
        .then((res) => navigator.mediaDevices.enumerateDevices())
        .then((devices) =>
        {
            camInputDevices = devices
                .filter((device) => device.kind === "videoinput");

            console.log("AVAILABLE", camInputDevices);
            inInputDevices.uiAttribs.values = camInputDevices.map((d, idx) => d.label || idx);
            outDevices.set(inInputDevices.uiAttribs.values);
            cgl.patch.loading.finished(loadingId);
            camLoaded = true;
            startWebcam();
        }).catch((e) =>
        {
            op.log("error", e);
            outError.set(e.name + ": " + e.message);
            cgl.patch.loading.finished(loadingId);
            camLoaded = false;
        });
}

inStart.onTriggered = () =>
{
    if (!started)
    {
        started = true;
        if (!camLoaded)
        {
            initDevices();
        }
    }
};

inTrigger.onTriggered = () =>
{
    if (started && camLoaded && active)
    {
        updateTexture();
        outUpdate.trigger();
    }
};
