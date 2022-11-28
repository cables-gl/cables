const
    inExec = op.inTrigger("Update"),
    filename = op.inUrl("file", "video"),
    play = op.inValueBool("play"),
    loop = op.inValueBool("loop"),
    autoPlay = op.inValueBool("auto play", false),

    volume = op.inValueSlider("Volume", 1),
    muted = op.inValueBool("mute", true),
    speed = op.inValueFloat("speed", 1),

    tfilter = op.inValueSelect("filter", ["nearest", "linear"], "linear"),
    wrap = op.inValueSelect("wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge"),

    flip = op.inValueBool("flip", true),
    fps = op.inValueFloat("fps", 30),
    time = op.inValueFloat("set time"),
    rewind = op.inTriggerButton("rewind"),

    inPreload = op.inValueBool("Preload", true),
    inShowSusp = op.inBool("Show Interaction needed Button", true),

    outNext = op.outTrigger("Next"),
    textureOut = op.outTexture("texture"),
    outDuration = op.outNumber("duration"),
    outProgress = op.outNumber("progress"),
    outInteractionNeeded = op.outBoolNum("Interaction Needed"),
    outTime = op.outNumber("CurrentTime"),
    loading = op.outBoolNum("Loading"),
    outPlaying = op.outBoolNum("Playing"),
    canPlayThrough = op.outBoolNum("Can Play Through", false),

    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height"),
    outAspect = op.outNumber("Aspect Ratio"),
    outHasError = op.outBoolNum("Has Error"),
    outError = op.outString("Error Message");

let videoElementPlaying = false;
let embedded = false;
const cgl = op.patch.cgl;
const videoElement = document.createElement("video");
videoElement.setAttribute("playsinline", "");
videoElement.setAttribute("webkit-playsinline", "");
let interActionNeededButton = false;
let addedListeners = false;
let cgl_filter = 0;
let cgl_wrap = 0;

const emptyTexture = CGL.Texture.getEmptyTexture(cgl);

op.toWorkPortsNeedToBeLinked(textureOut);

let tex = null;
textureOut.set(tex);
let timeout = null;
let firstTime = true;
textureOut.set(CGL.Texture.getEmptyTexture(cgl));
let needsUpdate = true;
let lastTime = 0;
play.onChange = updatePlayState;
filename.onChange = reload;
volume.onChange = updateVolume;
op.onMasterVolumeChanged = updateVolume;

op.onDelete = () =>
{
    videoElement.remove();
};

inExec.onTriggered = () =>
{
    if (performance.now() - lastTime > 1000 / fps.get())needsUpdate = true;

    if (needsUpdate)
    {
        lastTime = performance.now();
        updateTexture();
    }

    outPlaying.set(!videoElement.paused);

    if (interActionNeededButton && !videoElement.paused && play.get())
    {
        // remove button after player says no but plays anyhow after some time...
        interActionNeededButton = false;
        CABLES.interActionNeededButton.remove("videoplayer");
    }
    outInteractionNeeded.set(interActionNeededButton);

    outNext.trigger();
};

function reInitTexture()
{
    if (tex)tex.delete();
    tex = new CGL.Texture(cgl,
        {
            "wrap": cgl_wrap,
            "filter": cgl_filter
        });
}

autoPlay.onChange = function ()
{
    if (videoElement)
    {
        if (autoPlay.get())
        {
            videoElement.setAttribute("autoplay", "");
        }
        else
        {
            videoElement.removeAttribute("autoplay");
        }
    }
};

rewind.onTriggered = function ()
{
    videoElement.currentTime = 0;
    textureOut.set(emptyTexture);
    needsUpdate = true;
};

time.onChange = function ()
{
    videoElement.currentTime = time.get() || 0;
    needsUpdate = true;
};

fps.onChange = function ()
{
    needsUpdate = true;
};

function doPlay()
{
    videoElement.playbackRate = speed.get();
}

function updatePlayState()
{
    if (!embedded)
    {
        embedVideo(true);
    }

    if (play.get())
    {
        videoElement.currentTime = time.get() || 0;

        const promise = videoElement.play();

        if (promise)
            promise.then(function ()
            {
                doPlay();
                // Automatic playback started!
            }).catch(function (error)
            {
                op.warn("exc", error);
                console.log(error);
                console.log(videoElement);

                if (videoElement.paused && inShowSusp.get())
                {
                    interActionNeededButton = true;
                    CABLES.interActionNeededButton.add(op.patch, "videoplayer", () =>
                    {
                        interActionNeededButton = false;
                        videoElement.play();
                        doPlay();
                        CABLES.interActionNeededButton.remove("videoplayer");
                    });
                }
                // Automatic playback failed.
                // Show a UI element to let the user manually start playback.
            });
    }
    else videoElement.pause();
}

speed.onChange = function ()
{
    videoElement.playbackRate = speed.get();
};

loop.onChange = function ()
{
    videoElement.loop = loop.get();
};

muted.onChange = function ()
{
    videoElement.muted = muted.get();
};

tfilter.onChange = function ()
{
    if (tfilter.get() == "nearest") cgl_filter = CGL.Texture.FILTER_NEAREST;
    if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
    // if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;
    loadVideo();
    tex = null;
};

wrap.onChange = function ()
{
    if (wrap.get() == "repeat") cgl_wrap = CGL.Texture.WRAP_REPEAT;
    if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
    loadVideo();
    tex = null;
};

function updateTexture()
{
    const force = needsUpdate;

    if (!filename.get())
    {
        textureOut.set(emptyTexture);
        return;
    }

    if (!tex) reInitTexture();
    if (!videoElementPlaying) return;

    tex.setSize(videoElement.videoWidth, videoElement.videoHeight);
    // tex.height = videoElement.videoHeight;
    // tex.width = videoElement.videoWidth;

    outWidth.set(tex.width);
    outHeight.set(tex.height);
    outAspect.set(tex.width / tex.height);

    if (!tex)reInitTexture();
    if (!canPlayThrough.get()) return;
    if (!videoElementPlaying) return;
    if (!videoElement) return;
    if (videoElement.videoHeight <= 0)
    {
        op.setUiError("videosize", "video width is 0!");
        op.log(videoElement);
        return;
    }
    if (videoElement.videoWidth <= 0)
    {
        op.setUiError("videosize", "video height is 0!");
        op.log(videoElement);
        return;
    }

    const perc = (videoElement.currentTime) / videoElement.duration;
    if (!isNaN(perc)) outProgress.set(perc);

    outTime.set(videoElement.currentTime);

    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex.tex);

    if (firstTime)
    {
        cgl.gl.texImage2D(cgl.gl.TEXTURE_2D, 0, cgl.gl.RGBA, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, videoElement);
        cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, flip.get());
        tex._setFilter();
    }
    else
    {
        cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, flip.get());
        cgl.gl.texSubImage2D(cgl.gl.TEXTURE_2D, 0, 0, 0, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, videoElement);
    }

    if (flip.get()) cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, false);

    firstTime = false;

    textureOut.set(tex);

    op.patch.cgl.profileData.profileVideosPlaying++;

    if (videoElement.readyState == 4) loading.set(false);
    else loading.set(false);
}

function initVideo()
{
    videoElement.controls = false;
    videoElement.muted = muted.get();
    videoElement.loop = loop.get();

    needsUpdate = true;
    canPlayThrough.set(true);
}

function updateVolume()
{
    videoElement.volume = Math.min(1, Math.max(0, (volume.get() || 0) * op.patch.config.masterVolume));
}

function loadedMetaData()
{
    outDuration.set(videoElement.duration);
}

function embedVideo(force)
{
    outHasError.set(false);
    outError.set("");
    canPlayThrough.set(false);
    if (filename.get() && String(filename.get()).length > 1) firstTime = true;

    if (!filename.get())
    {
        outError.set(true);
    }

    if (inPreload.get() || force)
    {
        clearTimeout(timeout);
        loading.set(true);
        videoElement.preload = "true";

        let url = op.patch.getFilePath(filename.get());
        if (String(filename.get()).indexOf("data:") == 0) url = filename.get();
        if (!url) return;

        op.setUiError("onerror", null);
        videoElement.style.display = "none";
        videoElement.setAttribute("src", url);
        videoElement.setAttribute("crossOrigin", "anonymous");
        videoElement.playbackRate = speed.get();

        if (!addedListeners)
        {
            addedListeners = true;
            videoElement.addEventListener("canplaythrough", initVideo, true);
            videoElement.addEventListener("loadedmetadata", loadedMetaData);
            videoElement.addEventListener("playing", function () { videoElementPlaying = true; }, true);
            videoElement.onerror = function ()
            {
                outHasError.set(true);
                if (videoElement)
                {
                    outError.set("Error " + videoElement.error.code + "/" + videoElement.error.message);
                    op.setUiError("onerror", "Could not load video / " + videoElement.error.message, 2);
                }
            };
        }
        embedded = true;
    }
}

function loadVideo()
{
    setTimeout(embedVideo, 100);
}

function reload()
{
    if (!filename.get()) return;
    loadVideo();
}
