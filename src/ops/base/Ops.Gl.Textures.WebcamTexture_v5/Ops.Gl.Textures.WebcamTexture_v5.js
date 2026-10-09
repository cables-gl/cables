const
    inTrigger = op.inTrigger("Render"),
    inActive = op.inBool("Active", true),
    inGenTex = op.inBool("Generate Texture", true),
    inInputDevices = op.inDropDown("Webcam Input", ["Default"], "Default"),
    inWidth = op.inValueInt("Requested Width", 1280),
    inHeight = op.inValueInt("Requested Height", 720),

    flipX = op.inBool("Flip X", false),
    flipY = op.inBool("Flip Y", false),

    inAsDOM = op.inBool("Show HTML Element", false),
    inCss = op.inStringEditor("CSS", "z-index:99999;\nposition:absolute;\n", "inline-css"),
    htmlFlipX = op.inBool("Element Flip X", false),
    htmlFlipY = op.inBool("Element Flip Y", false),

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

const START_DELAY_MS = 50;
const RETRY_DELAY_MS = 500;
const MAX_RETRIES = 3;
const DEFAULT_DEVICE = "Default";

const cgl = op.patch.cgl;
const emptyTexture = CGL.Texture.getEmptyTexture(cgl);
const videoElement = document.createElement("video");

videoElement.setAttribute("id", "webcam" + op.id);
videoElement.setAttribute("autoplay", "");
videoElement.setAttribute("muted", "");
videoElement.setAttribute("playsinline", "");
videoElement.muted = true;
op.patch.cgl.canvas.parentElement.parentElement.appendChild(videoElement);

let tex = null;
let tc = null;
let loadingId = null;
let currentStream = null;
let camInputDevices = [];
let startTimeout = null;
let session = 0;
let retries = 0;
let hasError = false;
let active = false;
let deleting = false;
let permissionStatus = null;

textureOut.setRef(emptyTexture);

flipX.onChange =
    flipY.onChange = initCopyShader;

inInputDevices.onChange =
    inWidth.onChange =
    inHeight.onChange = startWebcam;
htmlFlipX.onChange = htmlFlipY.onChange = flipVideoElement;
inAsDOM.onChange = inCss.onChange = updateStyle;
inGenTex.onChange = playCam;

inActive.onChange = () =>
{
    if (inActive.get()) startWebcam();
    else stopStream();
};

initTexture();
updateStyle();

op.on("loadedValueSet", startWebcam);
if (navigator.mediaDevices) navigator.mediaDevices.addEventListener("devicechange", onDeviceChange);
if (navigator.permissions)
{
    navigator.permissions.query({ "name": "camera" })
        .then((status) =>
        {
            if (deleting) return;
            permissionStatus = status;
            permissionStatus.addEventListener("change", onPermissionChange);
        })
        .catch(() => {});
}

startWebcam();

op.onDelete = () =>
{
    deleting = true;
    if (navigator.mediaDevices) navigator.mediaDevices.removeEventListener("devicechange", onDeviceChange);
    if (permissionStatus) permissionStatus.removeEventListener("change", onPermissionChange);
    permissionStatus = null;
    stopStream();
    videoElement.remove();
    outElement.setRef(null);
    textureOut.setRef(emptyTexture);
    if (tc) tc.dispose();
    tc = null;
    if (tex) tex.delete();
    tex = null;
};

function initCopyShader()
{
    if (!tc) tc = new CGL.CopyTexture(cgl, "webcamFlippedTexture", { "shader": attachments.texcopy_frag });
    tc.bgShader.toggleDefine("FLIPX", flipX.get());
    tc.bgShader.toggleDefine("FLIPY", !flipY.get());
}

function initTexture()
{
    if (tex) tex.delete();
    tex = new CGL.Texture(cgl, { "name": "webcam" });
    tex.setSize(videoElement.videoWidth, videoElement.videoHeight);
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

function playCam()
{
    if (!currentStream) return;
    active = inGenTex.get();
    if (active) videoElement.play().catch(() => {});
    else videoElement.pause();
}

function updateTexture()
{
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex.tex);
    cgl.gl.texImage2D(cgl.gl.TEXTURE_2D, 0, cgl.gl.RGBA, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, videoElement);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);

    if (!tc) initCopyShader();
    textureOut.setRef(tc.copy(tex));
}

function finishLoading()
{
    if (loadingId) cgl.patch.loading.finished(loadingId);
    loadingId = null;
}

function stopTracks(stream)
{
    stream.getTracks().forEach((track) => { track.stop(); });
}

function stopStream()
{
    session++;
    clearTimeout(startTimeout);
    finishLoading();
    active = false;
    available.set(false);

    videoElement.onloadedmetadata = null;
    if (currentStream) stopTracks(currentStream);
    currentStream = null;

    videoElement.pause();
    videoElement.srcObject = null;
    videoElement.removeAttribute("src");
    videoElement.load();
}

function startWebcam()
{
    stopStream();
    if (deleting || !inActive.get()) return;
    retries = 0;
    startTimeout = setTimeout(openCam, START_DELAY_MS);
}

function findDevice(label)
{
    if (!label || label === DEFAULT_DEVICE || label === "...") return null;
    const device = camInputDevices.find((d) => { return d.label === label; });
    if (device) return device;
    return camInputDevices[label] || null;
}

function getCamConstraints()
{
    const constr = { "audio": false, "video": {} };
    const device = findDevice(inInputDevices.get()) || camInputDevices[0];
    if (device && device.deviceId) constr.video.deviceId = { "exact": device.deviceId };

    const width = { "min": 640 };
    const height = { "min": 480 };
    if (inWidth.get()) width.ideal = inWidth.get();
    if (inHeight.get()) height.ideal = inHeight.get();
    constr.video.width = width;
    constr.video.height = height;

    return constr;
}

function updateDeviceList()
{
    return navigator.mediaDevices.enumerateDevices()
        .then((devices) =>
        {
            camInputDevices = devices.filter((device) => { return device.kind === "videoinput"; });
            const values = camInputDevices.map((d, idx) => { return d.label || idx; });
            values.unshift(DEFAULT_DEVICE);
            inInputDevices.uiAttribs.values = values;
            outDevices.set(values);
            op.refreshParams();
        })
        .catch(() => {});
}

function openCam()
{
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
    {
        showError({ "name": "NotSupportedError", "message": "webcam access is not available" });
        return;
    }

    const mySession = session;
    const constr = getCamConstraints();
    finishLoading();
    loadingId = cgl.patch.loading.start("Webcam", "", op);

    navigator.mediaDevices.getUserMedia(constr)
        .catch((error) =>
        {
            if ((error.name == "NotFoundError" || error.name == "OverconstrainedError") && constr.video.deviceId)
            {
                delete constr.video.deviceId;
                return navigator.mediaDevices.getUserMedia(constr);
            }
            throw error;
        })
        .then((stream) =>
        {
            if (mySession != session)
            {
                stopTracks(stream);
                return;
            }
            currentStream = stream;
            return updateDeviceList().then(() =>
            {
                if (mySession != session) return;
                const wanted = findDevice(inInputDevices.get());
                if (!constr.video.deviceId && wanted && wanted.deviceId) return startWebcam();
                camInitComplete(stream, mySession);
            });
        })
        .catch((error) =>
        {
            if (mySession != session) return;
            finishLoading();
            if (error.name == "NotReadableError" && retries < MAX_RETRIES)
            {
                retries++;
                startTimeout = setTimeout(openCam, RETRY_DELAY_MS);
                return;
            }
            showError(error);
        });
}

function camInitComplete(stream, mySession)
{
    videoElement.onloadedmetadata = () =>
    {
        if (mySession != session) return;
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        const w = settings.width || videoElement.videoWidth || inWidth.get();
        const h = settings.height || videoElement.videoHeight || inHeight.get();

        outSelectedDevice.set(track.label);
        outHeight.set(h);
        outWidth.set(w);
        outRatio.set(settings.aspectRatio || w / h);

        hasError = false;
        retries = 0;
        outError.set("");
        op.setUiError("webcam", null);

        videoElement.setAttribute("width", w);
        videoElement.setAttribute("height", h);
        outElement.setRef(videoElement);

        tex.setSize(w, h);
        finishLoading();

        available.set(true);
        playCam();
    };
    videoElement.srcObject = stream;
}

function showError(error)
{
    hasError = true;
    outError.set(error.name + ": " + error.message);
    if (error.name == "NotFoundError") op.setUiError("webcam", "No webcam found", 1);
    else op.setUiError("webcam", error.name + ": " + error.message, 1);
}

function streamEnded()
{
    if (!currentStream) return false;
    const track = currentStream.getVideoTracks()[0];
    return !track || track.readyState == "ended";
}

function onDeviceChange()
{
    if (deleting || !inActive.get()) return;
    updateDeviceList();
    if (hasError || streamEnded()) startWebcam();
}

function onPermissionChange()
{
    if (deleting || !inActive.get()) return;
    if (permissionStatus.state == "granted" && hasError) startWebcam();
}

inTrigger.onTriggered = () =>
{
    if (active && currentStream && inActive.get())
    {
        updateTexture();
        outUpdate.trigger();
    }

    next.trigger();
};
