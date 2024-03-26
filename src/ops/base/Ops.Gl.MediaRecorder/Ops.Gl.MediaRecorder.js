const videoTypes = ["webm", "mp4", "x-matroska"];
const audioTypes = ["webm", "mp3", "x-matroska"];
const videoCodecs = ["vp9", "vp8", "avc1", "av1", "h265", "h264", "mpeg", "mp4a"];
const audioCodecs = ["opus", "pcm", "aac", "mp3", "ogg"];

const supportedVideos = getSupportedMimeTypes("video", videoTypes, videoCodecs, audioCodecs);

let startTime = 0;
let duration = 0;

function getSupportedMimeTypes(media, types, codecs, codecsB)
{
    const isSupported = MediaRecorder.isTypeSupported;
    const supported = [];

    types.forEach((type) =>
    {
        const mimeType = `${media}/${type}`;
        if (isSupported(mimeType))
            supported.push(mimeType);
    });

    types.forEach((type) =>
    {
        const mimeType = `${media}/${type}`;
        codecs.forEach((codec) =>
        {
            return [`${mimeType};codecs=${codec}`].forEach((variation) =>
            {
                if (isSupported(variation)) supported.push(variation);

                codecsB.forEach((codecB) =>
                {
                    return [`${mimeType};codecs=${codec},${codecB}`].forEach((eachVariation) =>
                    {
                        if (isSupported(eachVariation)) supported.push(eachVariation);
                    });
                });
            });
        });
    });
    return supported;
}

// / ////////////////

const
    recordingToggle = op.inBool("Recording", false),

    inFilename = op.inString("Filename", "cables"),
    inDownl = op.inBool("Download Video", true),

    inCodecs = op.inDropDown("Mimetype", supportedVideos),
    inMbit = op.inFloat("MBit", 5),
    inFPSMax = op.inFloat("Max FPS", 30),
    inFPS = op.inFloat("Force FPS", 0),

    inMedia = op.inSwitch("Media", ["Video", "Audio", "Audio+Video"], "Video"),
    inAudio = op.inObject("Audio In", null, "audioNode"),
    inCanvasId = op.inString("Video Canvas Id", "glcanvas"),

    outState = op.outString("State"),
    outError = op.outString("Error"),
    outCodec = op.outString("Final Mimetype"),
    outCodecs = op.outArray("Valid Mimetypes", supportedVideos),
    outDuration = op.outNumber("Duration"),
    outFinished = op.outTrigger("Finished Recording"),

    outDataUrl = op.outString("Video DataUrl");

op.setPortGroup("Inputs", [inMedia, inAudio, inCanvasId]);
op.setPortGroup("Encoding", [inMbit, inCodecs, inFPS, inFPSMax]);

const gl = op.patch.cgl.gl;
let fb = null;
const cgl = op.patch.cgl;

let cgl_filter = 0;
let cgl_wrap = 0;
let tex = null;
let timeout = null;
let firstTime = true;
let mediaRecorder;
let recordedBlobs;
let sourceBuffer;

recordingToggle.onChange = toggleRecording;

inFPSMax.onChange =
    inFPS.onChange =
    inMbit.onChange =
    inMedia.onChange =
    inAudio.onChange =
    inCanvasId.onChange =
    inCodecs.onChange = setupMediaRecorder;

op.patch.cgl.on("resize", () =>
{
    if (mediaRecorder && mediaRecorder.state === "active")mediaRecorder.stop();
    mediaRecorder = null;
});

setupMediaRecorder();

function handleDataAvailable(event)
{
    if (event.data && event.data.size > 0)
    {
        recordedBlobs.push(event.data);
    }
}

function toggleRecording()
{
    if (recordingToggle.get())
    {
        startTime = performance.now();
        startRecording();
    }
    else
    {
        duration = performance.now() - startTime;
        outDuration.set(duration);
        stopRecording();
    }
}

function setupMediaRecorder()
{
    outCodec.set("unknown");

    outState.set("");
    outCodec.set("");
    outError.set("");
    op.setUiError("constr", null);
    op.setUiError("audionoaudio", null);
    op.setUiError("nocanvas", null);
    mediaRecorder = null;

    if (inCodecs.get() === "" || inCodecs.get() === 0)
    {
        return;
    }

    let codec = inCodecs.get();

    if (supportedVideos.indexOf(codec) == -1)
    {
        codec = supportedVideos[0];
        console.log("incompaticle codec, switching to first one:", codec);
    }

    let options = { "mimeType": codec, "videoBitsPerSecond": inMbit.get() * 1024 * 1024 };
    recordedBlobs = [];
    try
    {
        const canvas = document.getElementById(inCanvasId.get());
        if (!canvas)
        {
            op.setUiError("nocanvas", "canvas not found ");
            return;
        }
        canvas.getContext("2d");
        const streamVid = canvas.captureStream(inFPSMax.get());

        let stream = streamVid;
        if (inMedia.get() !== "Video")
        {
            const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
            const streamAudio = audioCtx.createMediaStreamDestination();

            if (!inAudio.get())
            {
                op.setUiError("audionoaudio", "no audio connected ");
                return;
            }
            inAudio.get().connect(streamAudio);

            if (inMedia.get() === "Audio+Video")stream = new MediaStream([...streamVid.getTracks(), ...streamAudio.stream.getTracks()]);
            else stream = streamAudio.stream ? streamAudio.stream : streamAudio;
        }

        mediaRecorder = new MediaRecorder(stream, options);
    }
    catch (err)
    {
        op.error(err);
        op.error("error mr constructor: ", err);
        outError.set(err.message);
        op.setUiError("contr", "MediaRecorder error: " + err.message);
    }
    if (mediaRecorder)
    {
        outState.set(mediaRecorder.state);
        outCodec.set(mediaRecorder.mimeType);
    }
    else
    {
        op.warn("no mediarecorder created...");
    }
}

// The nested try blocks will be simplified when Chrome 47 moves to Stable
function startRecording()
{
    if (!mediaRecorder)setupMediaRecorder();
    if (!mediaRecorder)
    {
        op.setUiError("noobj", "could not create mediarecorder, try setting all parameters");
        return;
    }

    recordedBlobs = [];

    op.setUiError("noobj", null);

    op.verbose("start recording: ", inCodecs.get());

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(1000);
    outState.set(mediaRecorder.state);

    if (inFPS.get() != 0)
    {
        mediaRecorder.pause();
        interValRecording();
    }
    op.log("MediaRecorder started", mediaRecorder);
}

function interValRecording()
{
    if (mediaRecorder.state === "inactive") return;
    mediaRecorder.resume();

    setTimeout(
        () =>
        {
            if (mediaRecorder && mediaRecorder.state != "inactive") mediaRecorder.pause();
            interValRecording();
        }, 1000 / inFPS.get());
}

function stopRecording()
{
    if (!mediaRecorder)
    {
        // op.warn("cant stop no mediarecorder");
        return;
    }

    op.verbose("mediaRecorder.state", mediaRecorder.state);
    if (mediaRecorder.state === "inactive") return;

    // op.verbose("mediaRecorder.videoBitsPerSecond  ", mediaRecorder.videoBitsPerSecond / 1024 / 1024);
    // op.verbose("mediaRecorder.mimeType  ", mediaRecorder.mimeType);
    outCodec.set(mediaRecorder.mimeType);

    mediaRecorder.onstop = download;

    mediaRecorder.stop();
    outState.set(mediaRecorder.state);
    op.verbose("Recorded Blobs: ", recordedBlobs);
    // download();
}

function download()
{
    if (recordedBlobs.length === 0)
    {
        op.warn("download canceled, no recordedBlobs");
    }

    if (!mediaRecorder) return;

    const blob = new Blob(recordedBlobs, { "type": "application/octet-stream" });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    const codec = mediaRecorder.mimeType;
    let ext = "webm";
    if (codec.indexOf("video/x-matroska") >= 0)ext = "mkv";
    if (codec.indexOf("video/mp4") >= 0)ext = "mp4";

    if (inDownl.get())
    {
        a.download = (inFilename.get() || "cables") + "." + ext;
        document.body.appendChild(a);
        a.click();
    }

    if (inDownl.get())
        setTimeout(() =>
        {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);

    outDataUrl.set(url);
    //     outBlobs.setRef({ "blob": blob, "duration": duration });
    // }
    outFinished.trigger();
}
