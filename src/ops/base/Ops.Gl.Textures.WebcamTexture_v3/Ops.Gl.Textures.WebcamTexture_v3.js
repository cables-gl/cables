const
    inTrigger = op.inTrigger("Render"),
    inActive = op.inBool("Active", true),
    inGenTex = op.inValueBool("Generate Texture", true),
    inInputDevices = op.inDropDown("Webcam Input", ["Default"], "Default"),
    inWidth = op.inValueInt("Requested Width", 1280),
    inHeight = op.inValueInt("Requested Height", 720),

    flipX = op.inValueBool("Flip X", false),
    flipY = op.inValueBool("Flip Y", false),

    inAsDOM = op.inValueBool("Show HTML Element", false),
    inCss = op.inStringEditor("CSS", "z-index:99999;\nposition:absolute;\n", "inline-css"),
    htmlFlipX = op.inValueBool("Element Flip X", false),
    htmlFlipY = op.inValueBool("Element Flip Y", false),

    next = op.outTrigger("Next"),
    textureOut = op.outTexture("Texture"),

    outRatio = op.outNumber("Ratio"),
    available = op.outBoolNum("Available"),
    outWidth = op.outNumber("Size Width"),
    outHeight = op.outNumber("Size Height"),
    outError = op.outString("Error"),
    outElement = op.outObject("HTML Element", null, "element"),
    outDevices = op.outArray("Available devices"),
    outSelectedDevice = op.outString("Active device"),
    outUpdate = op.outTrigger("Texture updated");

op.setPortGroup("Camera", [inInputDevices, inWidth, inHeight]);
op.setPortGroup("Texture", [flipX, flipY]);
op.setPortGroup("Video Element", [inAsDOM, inCss, htmlFlipX, htmlFlipY]);

op.toWorkPortsNeedToBeLinked(inTrigger);

let tries = 0;
const cgl = op.patch.cgl;
const emptyTexture = CGL.Texture.getEmptyTexture(cgl);
const videoElement = document.createElement("video");
const eleId = "webcam" + op.id;

videoElement.setAttribute("id", eleId);
videoElement.setAttribute("autoplay", "");
videoElement.setAttribute("muted", "");
videoElement.setAttribute("playsinline", "");
videoElement.setAttribute("style", inCss.get());
op.patch.cgl.canvas.parentElement.parentElement.appendChild(videoElement);
// let oldCanvasParent = op.patch.cgl.canvas.parentElement;

let tex = null;
let initingDevices = false;
let restarting = false;
let started = false;
let camsLoaded = false;
let loadingId = null;
let currentStream = null;
let camInputDevices = null;
let active = false;
let alreadyRetried = false;
let constraints = null;
let tc = null;

textureOut.set(emptyTexture);

flipX.onChange =
flipY.onChange = initCopyShader;

inInputDevices.onChange =
    inWidth.onChange =
    inHeight.onChange = restartWebcam;
htmlFlipX.onChange = htmlFlipY.onChange = flipVideoElement;
op.onDelete = removeElement;
inAsDOM.onChange = inCss.onChange = updateStyle;

initTexture();
updateStyle();

op.on("loadedValueSet", delayedInitDevices);
inActive.onChange = delayedInitDevices;

function delayedInitDevices()
{
    setTimeout(() =>
    {
        if (inActive.get()) initDevices();
    }, 50);
}

function initCopyShader()
{
    if (!tc)tc = new CGL.CopyTexture(cgl, "webcamFlippedTexture", { "shader": attachments.texcopy_frag });
    tc.bgShader.toggleDefine("FLIPX", flipX.get());
    tc.bgShader.toggleDefine("FLIPY", !flipY.get());
}

function initTexture()
{
    if (tex)tex.delete();
    tex = new CGL.Texture(cgl, { "name": "webcam" });
    if (videoElement) tex.setSize(videoElement.videoWidth, videoElement.videoHeight);
}

function removeElement()
{
    if (videoElement) videoElement.remove();
}

function updateStyle()
{
    if (!inAsDOM.get()) videoElement.setAttribute("style", "display:none;");
    else videoElement.setAttribute("style", inCss.get());

    inCss.setUiAttribs({ "greyout": !inAsDOM.get() });
    htmlFlipX.setUiAttribs({ "greyout": !inAsDOM.get() });
    htmlFlipY.setUiAttribs({ "greyout": !inAsDOM.get() });
}

function flipVideoElement()
{
    if (htmlFlipX.get() && !htmlFlipY.get()) videoElement.style.transform = "scaleX(-1)";
    else if (!htmlFlipX.get() && htmlFlipY.get()) videoElement.style.transform = "scaleY(-1)";
    else if (htmlFlipX.get() && htmlFlipY.get()) videoElement.style.transform = "scale(-1, -1)";
    else videoElement.style.transform = "unset";
}

function playCam(shouldPlay)
{
    if (started && camsLoaded)
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

inGenTex.onChange = () =>
{
    playCam(inGenTex.get());
};

function updateTexture()
{
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex.tex);

    cgl.gl.texImage2D(cgl.gl.TEXTURE_2D, 0, cgl.gl.RGBA, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, videoElement);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);
    // textureOut.set(emptyTexture);

    if (!tc)initCopyShader();
    if (tc)textureOut.setRef(tc.copy(tex));
}

function stopStream()
{
    if (!currentStream) return;

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
        outSelectedDevice.set(stream.getTracks()[0].label);
        if (inInputDevices.get() != "Default" && stream.getTracks()[0].label != inInputDevices.get() && tries < 3)
        {
            tries++;
            return restartWebcam();
        }

        const settings = stream.getTracks()[0].getSettings();
        restarting = false;

        const w = settings.width || inWidth.get();
        const h = settings.height || inHeight.get();

        outHeight.set(h);
        outWidth.set(w);
        outRatio.set(settings.aspectRatio || w / h);
        outError.set("");

        videoElement.setAttribute("width", settings.width);
        videoElement.setAttribute("height", settings.height);

        outElement.set(videoElement);

        tex.setSize(w, h);

        available.set(true);
        playCam(inGenTex.get());
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
    let constr = { "audio": false, "video": {} };

    if (camsLoaded)
    {
        let deviceLabel = inInputDevices.get();
        let deviceInfo = null;

        if (!deviceLabel || deviceLabel === "Default" || deviceLabel === "...")
        {
            deviceInfo = Object.values(camInputDevices)[0];
        }
        else
        {
            deviceInfo = camInputDevices.filter((d) => { return d.label === deviceLabel; });
            if (deviceInfo)
            {
                deviceInfo = deviceInfo[0];
            }
            else
            { // otherwise get by number
                deviceInfo = Object.values(camInputDevices)[deviceLabel];
            }

            if (!deviceInfo)
            {
                deviceInfo = Object.values(camInputDevices)[0];
            }
        }
        constr.video = { "deviceId": { "exact": deviceInfo.deviceId } };
    }

    // constr.video.facingMode = { "exact": inFacing.get() };

    const w = inWidth.get();
    const h = inHeight.get();
    let width = { "min": 640 };
    let height = { "min": 480 };

    if (w)
        width.ideal = w;

    if (h)
        height.ideal = h;

    constr.video.width = width;
    constr.video.height = height;

    return constr;
}

function restartWebcam()
{
    if (!inActive.get()) return;
    stopStream();
    restarting = true;

    const constr = getCamConstraints();

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    {
        navigator.mediaDevices.getUserMedia(constr)
            .then(camInitComplete)
            .catch((error) =>
            {
                restarting = false;
                op.logError(error.name + ": " + error.message, error);
                outError.set(error.name + ": " + error.message);
            });
    }
    else if (navigator.getUserMedia)
    {
        restarting = false;
        navigator.getUserMedia(constr, camInitComplete, () => { return available.set(false); });
    }
}

function initDevices()
{
    if (!inActive.get()) return;
    initingDevices = true;
    if (loadingId)cgl.patch.loading.finished(loadingId);
    loadingId = cgl.patch.loading.start("Webcam inputs", "", op);
    const constraints = getCamConstraints();

    navigator.mediaDevices.getUserMedia(constraints)
        .then((res) => { return navigator.mediaDevices.enumerateDevices(); })
        .then((devices) =>
        {
            camInputDevices = devices
                .filter((device) => { return device.kind === "videoinput"; });

            initingDevices = false;
            inInputDevices.uiAttribs.values = camInputDevices.map((d, idx) => { return d.label || idx; });
            inInputDevices.uiAttribs.values.unshift("Default");
            outDevices.set(inInputDevices.uiAttribs.values);
            cgl.patch.loading.finished(loadingId);

            camsLoaded = true;

            restartWebcam();
            started = true;
        }).catch((e) =>
        {
            initingDevices = false;
            op.error("error", e);
            outError.set(e.name + ": " + e.message);
            cgl.patch.loading.finished(loadingId);
            camsLoaded = false;
        });
}

inTrigger.onTriggered = () =>
{
    if (!initingDevices && inActive.get())
    {
        if (started && camsLoaded && active)
        {
            updateTexture();
            outUpdate.trigger();
        }

        if (!started && camsLoaded)
        {
            restartWebcam();
        }
    }

    next.trigger();
};
