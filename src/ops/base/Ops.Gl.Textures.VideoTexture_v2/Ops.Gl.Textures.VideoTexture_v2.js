const
    filename = op.inUrl("file", "video"),
    play = op.inValueBool("play"),
    loop = op.inValueBool("loop"),
    autoPlay = op.inValueBool("auto play", false),
    volume = op.inValueSlider("Volume"),
    muted = op.inValueBool("mute", true),
    speed = op.inValueFloat("speed", 1),
    tfilter = op.inValueSelect("filter", ["nearest", "linear"]),
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
    canPlayThrough = op.outValueBool("Can Play Through", false);


const
    outWidth = op.outNumber("Width"),
    outHeight = op.outNumber("Height"),
    outAspect = op.outNumber("Aspect Ratio");


let videoElementPlaying = false;
let embedded = false;
const cgl = op.patch.cgl;
const videoElement = document.createElement("video");
videoElement.setAttribute("playsinline", "");
videoElement.setAttribute("webkit-playsinline", "");


fps.set(25);
volume.set(1);

let cgl_filter = 0;
let cgl_wrap = 0;

const emptyTexture = CGL.Texture.getEmptyTexture(cgl);

let tex = null;
textureOut.set(tex);
let timeout = null;
let firstTime = true;
textureOut.set(CGL.Texture.getEmptyTexture(cgl));

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
    // updateTexture();
};

time.onChange = function ()
{
    videoElement.currentTime = time.get() || 0;
    updateTexture();
};

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
        videoElement.currentTime = time.get() || 0;

        videoElement.play();
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
    tex = null;
};

wrap.onChange = function ()
{
    if (wrap.get() == "repeat") cgl_wrap = CGL.Texture.WRAP_REPEAT;
    if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
    tex = null;
};

function updateTexture()
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
        console.log("video size is 0!");
        console.log(videoElement);
        return;
    }
    if (videoElement.videoWidth <= 0)
    {
        console.log("video width is 0!");
        console.log(videoElement);
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

    firstTime = false;

    textureOut.set(tex);

    CGL.profileData.profileVideosPlaying++;


    if (videoElement.readyState == 4) loading.set(false);
    else loading.set(false);
}

function initVideo()
{
    videoElement.controls = false;
    videoElement.muted = muted.get();
    videoElement.loop = loop.get();
    if (play.get()) videoElement.play();
    updateTexture();
    canPlayThrough.set(true);
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

    // console.log('loaded metadata...');
    // console.log('length ',videoElement.buffered.length);
    // console.log('duration ',videoElement.duration);
    // console.log('bytesTotal ',videoElement.bytesTotal);
    // console.log('bufferedBytes ',videoElement.bufferedBytes);
    // console.log('buffered ',videoElement.buffered);
}


let addedListeners = false;

function embedVideo(force)
{
    canPlayThrough.set(false);
    if (filename.get() != 0 && filename.get().length > 1)
        if (inPreload.get() || force)
        {
        // console.log("embedVideo"+filename.get() );
            clearTimeout(timeout);
            loading.set(true);
            videoElement.preload = "true";
            const url = op.patch.getFilePath(filename.get());
            videoElement.setAttribute("src", url);
            videoElement.setAttribute("crossOrigin", "anonymous");
            videoElement.playbackRate = speed.get();
            if (!addedListeners)
            {
                addedListeners = true;
                videoElement.addEventListener("canplaythrough", initVideo, true);
                videoElement.addEventListener("loadedmetadata", loadedMetaData);
                videoElement.addEventListener("playing", function () { videoElementPlaying = true; }, true);
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

filename.onChange = reload;
