// todo: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/facingMode

const
    inFacing = op.inSwitch("Facing", ["environment", "user"], "user"),
    flip = op.inValueBool("flip", true),
    fps = op.inValueInt("fps", 30),
    inActive = op.inValueBool("Genrate Texture", true),

    width = op.inValueInt("Width", 640),
    height = op.inValueInt("Height", 480),

    inAsDOM = op.inValueBool("Show HTML Element", false),
    textureOut = op.outTexture("texture"),
    inCss = op.inStringEditor("CSS", "z-index:99999;position:absolute;"),
    outRatio = op.outValue("Ratio"),
    available = op.outValue("Available"),
    outWidth = op.outNumber("Size Width"),
    outHeight = op.outNumber("Size Height"),
    outError = op.outString("Error"),
    outElement = op.outObject("HTML Element");

op.setPortGroup("Texture", [flip, fps, inActive]);
op.setPortGroup("Video Element", [inAsDOM, inCss]);

width.onChange =
    height.onChange =
    inFacing.onChange = startWebcam;

const cgl = op.patch.cgl;
const videoElement = document.createElement("video");
const eleId = "webcam" + CABLES.uuid();
// videoElement.style.display = "none";
videoElement.setAttribute("id", eleId);
videoElement.setAttribute("autoplay", "");
videoElement.setAttribute("muted", "");
videoElement.setAttribute("playsinline", "");
videoElement.setAttribute("style", inCss.get());
op.patch.cgl.canvas.parentElement.appendChild(videoElement);

const tex = new CGL.Texture(cgl, { "name": "webcam" });
tex.setSize(8, 8);
textureOut.set(tex);

let timeout = null;
let canceled = false;

op.onDelete = removeElement;

inAsDOM.onChange =
    inCss.onChange = updateStyle;

window.addEventListener("focus", resetTimeout);
document.addEventListener("visibilitychange", resetTimeout);

updateStyle();
startWebcam();

function removeElement()
{
    if (videoElement) videoElement.remove();
    clearTimeout(timeout);
}

function updateStyle()
{
    if (!inAsDOM.get()) videoElement.setAttribute("style", "display:none;");
    else videoElement.setAttribute("style", inCss.get());
}

inActive.onChange = function ()
{
    if (inActive.get())
    {
        canceled = false;
        updateTexture();
    }
    else
    {
        canceled = true;
    }
};

function resetTimeout()
{
    clearTimeout(timeout);
    updateTexture();
    timeout = setTimeout(updateTexture, 1000 / fps.get());
}

fps.onChange = function ()
{
    if (fps.get() < 1)fps.set(1);
    resetTimeout();
};

function updateTexture()
{
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex.tex);
    cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, flip.get());

    cgl.gl.texImage2D(cgl.gl.TEXTURE_2D, 0, cgl.gl.RGBA, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, videoElement);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);

    outHeight.set(videoElement.videoHeight || width.get());
    outWidth.set(videoElement.videoWidth || height.get());

    tex.setSize(videoElement.videoWidth || width.get(), videoElement.videoHeight || height.get());

    outRatio.set(videoElement.videoWidth / videoElement.videoHeight);

    cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, false);

    if (!canceled) timeout = setTimeout(updateTexture, 1000 / fps.get());
}

function camInitComplete(stream)
{
    tex.videoElement = videoElement;
    outElement.set(videoElement);
    // videoElement.src = window.URL.createObjectURL(stream);
    videoElement.srcObject = stream;
    // tex.videoElement=stream;
    videoElement.onloadedmetadata = function (e)
    {
        available.set(true);

        // videoElement.setAttribute("height", videoElement.videoHeight);
        // videoElement.setAttribute("width", videoElement.videoWidth);

        outRatio.set(videoElement.videoWidth / videoElement.videoHeight);
        outError.set("");
        videoElement.play();
        updateTexture();
    };
}

function startWebcam()
{
    const constraints = { "audio": false, "video": {} };

    constraints.video.facingMode = inFacing.get();
    constraints.video.width = { "ideal": width.get() };
    constraints.video.height = { "ideal": height.get() };

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    // navigator.mediaDevices.getUserMedia ||

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(camInitComplete)
            .catch(function (error)
            {
                op.logError(error.name + ": " + error.message);
                outError.set(error.name + ": " + error.message);
            });
    }
    else
    if (navigator.getUserMedia)
    {
        navigator.getUserMedia(constraints, camInitComplete,
            function ()
            {
                available.set(false);
            });
    }
}
