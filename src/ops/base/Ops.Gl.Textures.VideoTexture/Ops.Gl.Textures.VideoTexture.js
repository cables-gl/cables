const
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
    fps = op.inValueFloat("fps", 25),
    time = op.inValueFloat("set time"),
    rewind = op.inTriggerButton("rewind"),

    inPreload = op.inValueBool("Preload", true),

    textureOut = op.outTexture("texture"),
    outDuration = op.outValue("duration"),
    outProgress = op.outValue("progress"),
    outTime = op.outValue("CurrentTime"),
    loading = op.outValue("Loading"),
    canPlayThrough = op.outValueBool("Can Play Through", false),

    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height"),
    outAspect = op.outNumber("Aspect Ratio"),
    outHasError = op.outBool("Has Error"),
    outError = op.outString("Error Message");

let videoElementPlaying = false;
let embedded = false;
const cgl = op.patch.cgl;
const videoElement = document.createElement("video");
videoElement.setAttribute("playsinline", "");
videoElement.setAttribute("webkit-playsinline", "");

let cgl_filter = 0;
let cgl_wrap = 0;

const emptyTexture = CGL.Texture.getEmptyTexture(cgl);

let tex = null;
textureOut.set(tex);
let timeout = null;
let firstTime = true;
textureOut.set(CGL.Texture.getEmptyTexture(cgl));

let currentTime = 0;
let isInitialized = false;

function reInitTexture()
{
    if (tex)tex.delete();
    tex = new CGL.Texture(cgl,
        {
            "wrap": cgl_wrap,
            "filter": cgl_filter
        });
}

autoPlay.onChange = () =>
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

rewind.onTriggered = () =>
{
    resetTime();
    videoElement.pause();
};

time.onChange = resetTime;

function resetTime()
{
    videoElement.currentTime = Math.abs(time.get()) || 0;
    currentTime = videoElement.currentTime;
    updateTexture(true);
}

fps.onChange = function ()
{
    if (fps.get() < 0.1)fps.set(1);
    clearTimeout(timeout);
    timeout = setTimeout(updateTexture, 1000 / fps.get());
};

play.onChange = function ()
{
    if (!embedded)
    {
        embedVideo(true);
    }

    if (play.get())
    {
        videoElement.currentTime = currentTime;

        // try
        // {
        const promise = videoElement.play();

        if (promise)
            promise.then(function ()
            {
                // Automatic playback started!
            }).catch(function (error)
            {
                op.warn("exc", error);
                // Automatic playback failed.
                // Show a UI element to let the user manually start playback.
            });

        // }
        // catch(e)
        // {
        // op.warn('exc',e);
        // }

        updateTexture();
        videoElement.playbackRate = speed.get();
    }
    else videoElement.pause();
};

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

function updateTexture(force)
{
    if (!filename.get())
    {
        textureOut.set(emptyTexture);
        return;
    }

    if (!force)
    {
        if (play.get())
        {
            clearTimeout(timeout);
            timeout = setTimeout(updateTexture, 1000 / fps.get());
        }
        else
        {
            return;
        }
    }

    if (!tex)reInitTexture();

    if (!videoElementPlaying) return;

    tex.height = videoElement.videoHeight;
    tex.width = videoElement.videoWidth;

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

    currentTime = videoElement.currentTime;
    const perc = currentTime / videoElement.duration;
    if (!isNaN(perc)) outProgress.set(perc);


    outTime.set(currentTime);


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

    if (!isInitialized)
    {
        initVideoFirstRun();
    }

    if (play.get()) videoElement.play();
    updateTexture(true);
    canPlayThrough.set(true);
}

function initVideoFirstRun()
{
    isInitialized = true;
    videoElement.muted = true;
    videoElement.play();
    updateTexture(true);
    setTimeout(resetTime, 50);
    videoElement.pause();
}

function updateVolume()
{
    videoElement.volume = (volume.get() || 0) * op.patch.config.masterVolume;
}

volume.onChange = updateVolume;
op.onMasterVolumeChanged = updateVolume;

function loadedMetaData()
{
    outDuration.set(videoElement.duration);
}

let addedListeners = false;

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
            videoElement.addEventListener("seeked", (event) =>
            {
                updateTexture(true);
            });

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
    isInitialized = false;
    loadVideo();
}

filename.onChange = reload;
