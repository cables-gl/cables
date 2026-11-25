const
    exec = op.inTrigger("Render"),
    inCodec = op.inDropDown("Codec", ["H.264", "HEVC", "VP9", "AV1"], "H.264"),
    inContainer = op.inSwitch("Container", ["MP4", "WebM"], "MP4"),
    inQuality = op.inDropDown("Quality", ["Very Low", "Low", "Medium", "High", "Very High"], "High"),
    inFps = op.inInt("FPS", 30),
    inStart = op.inTriggerButton("Start"),
    inStop = op.inTriggerButton("Stop"),
    next = op.outTrigger("Next"),
    outSupported = op.outBoolNum("Supported"),
    outError = op.outString("Error"),
    outRecording = op.outBoolNum("Recording"),
    outFrames = op.outNumber("Frames"),
    outDropped = op.outNumber("Dropped Frames"),
    outDuration = op.outNumber("Duration"),
    outUrl = op.outString("Blob URL"),
    outReport = op.outObject("Report"),
    outFinished = op.outTrigger("Finished");

op.setPortGroup("Encoding", [inCodec, inContainer, inQuality, inFps]);
op.setPortGroup("Recording", [inStart, inStop]);

outUrl.ignoreValueSerialize = true;

const CODECS = { "H.264": "avc", "HEVC": "hevc", "VP9": "vp9", "AV1": "av1" };
const QUALITIES = {
    "Very Low": mediabunny.QUALITY_VERY_LOW,
    "Low": mediabunny.QUALITY_LOW,
    "Medium": mediabunny.QUALITY_MEDIUM,
    "High": mediabunny.QUALITY_HIGH,
    "Very High": mediabunny.QUALITY_VERY_HIGH
};

let state = "idle";
let output = null;
let source = null;
let pending = null;
let startTime = 0;
let nextTime = 0;
let lastT = 0;
let frames = 0;
let droppedEncoderBusy = 0;
let droppedRenderStall = 0;
let startupMs = 0;
let lastTs = 0;
let recFps = 0;
let recWidth = 0;
let recHeight = 0;
let blobUrl = null;
let checkId = 0;
let supportOk = false;

inCodec.onChange = inContainer.onChange = inQuality.onChange = checkSupport;
inStart.onTriggered = start;
inStop.onTriggered = stop;
exec.onTriggered = render;

const resizeListener = op.patch.cgl.on("resize", () =>
{
    if (state == "idle") checkSupport();
});

op.onDelete = () =>
{
    op.patch.cgl.off(resizeListener);
    if (output && state != "idle") output.cancel();
    revokeUrl();
};

outSupported.set(typeof VideoEncoder !== "undefined");
updateButtons();
checkSupport();

function setState(s)
{
    state = s;
    updateButtons();
}

function updateButtons()
{
    inStart.setUiAttribs({ "greyout": state != "idle" || !supportOk });
    inStop.setUiAttribs({ "greyout": state != "recording" });
}

function setError(msg, options)
{
    op.setUiError("error", msg, 2, options);
    outError.set(msg || "");
    return !msg;
}

function fixSize()
{
    const cgl = op.patch.cgl;
    const w = Math.ceil(cgl.canvas.width / 2) * 2 / cgl.pixelDensity;
    const h = Math.ceil(cgl.canvas.height / 2) * 2 / cgl.pixelDensity;

    if (window.gui)
    {
        gui.canvasManager.setSize(w, h);
        gui.rendererWidth = w;
        gui.rendererHeight = h;
        gui.setLayout();
    }
    else cgl.setSize(w, h);
}

function checkSupport()
{
    const id = ++checkId;
    return isSupported().then((ok) =>
    {
        if (id != checkId) return false;
        supportOk = ok;
        updateButtons();
        return ok;
    });
}

function isSupported()
{
    if (typeof VideoEncoder === "undefined") return Promise.resolve(setError("WebCodecs (VideoEncoder) is not available in this browser"));

    const codec = CODECS[inCodec.get()];
    if (inContainer.get() == "WebM" && (codec == "avc" || codec == "hevc")) return Promise.resolve(setError(inCodec.get() + " can not be stored in WebM, use MP4 or VP9/AV1"));

    const canvas = op.patch.cgl.canvas;
    if ((codec == "avc" || codec == "hevc") && (canvas.width % 2 || canvas.height % 2)) return Promise.resolve(setError(inCodec.get() + " needs an even canvas size, current size is " + canvas.width + "x" + canvas.height, { "button": "Fix size", "buttonCb": fixSize }));

    return mediabunny.canEncodeVideo(codec, { "width": canvas.width, "height": canvas.height, "bitrate": QUALITIES[inQuality.get()] })
        .then((supported) =>
        {
            if (!supported) return setError(inCodec.get() + " encoding is not supported by this browser at " + canvas.width + "x" + canvas.height);
            return setError(null);
        });
}

function start()
{
    if (state != "idle") return;
    setState("starting");

    checkSupport()
        .then((ok) =>
        {
            if (!ok)
            {
                setState("idle");
                return;
            }

            const fps = Math.max(1, inFps.get());
            const format = inContainer.get() == "WebM" ? new mediabunny.WebMOutputFormat() : new mediabunny.Mp4OutputFormat();

            output = new mediabunny.Output({ "format": format, "target": new mediabunny.BufferTarget() });
            source = new mediabunny.CanvasSource(op.patch.cgl.canvas,
            {
                "codec": CODECS[inCodec.get()],
                "bitrate": QUALITIES[inQuality.get()],
                "sizeChangeBehavior": "contain"
            });
            output.addVideoTrack(source, { "frameRate": fps });

            let warmupStart = 0;
            return output.start()
                // the first encode is slow, doing it before the clock starts keeps it from dropping the following frames
                .then(() =>
                {
                    warmupStart = performance.now();
                    return source.add(0, 1 / fps);
                })
                .then(() =>
                {
                    startupMs = performance.now() - warmupStart;
                    recFps = fps;
                    recWidth = op.patch.cgl.canvas.width;
                    recHeight = op.patch.cgl.canvas.height;
                    lastTs = 0;
                    frames = 1;
                    droppedEncoderBusy = 0;
                    droppedRenderStall = 0;
                    outReport.setRef(null);
                    nextTime = 1 / fps;
                    lastT = 0;
                    pending = null;
                    startTime = performance.now();
                    setState("recording");
                    outRecording.set(true);
                    outFrames.set(1);
                    outDropped.set(0);
                    outDuration.set(0);
                });
        })
        .catch(fail);
}

function render()
{
    next.trigger();

    if (state != "recording") return;

    const frameDur = 1 / Math.max(1, inFps.get());
    const t = (performance.now() - startTime) / 1000;
    const renderDt = t - lastT;
    lastT = t;

    // timestamps have to be on the frame grid: the muxer rounds them to 1/fps, jittery real times collide into duplicates and gaps.
    // a render up to half a render interval early belongs to the next slot, so jitter can not move frames between slots
    if (t < nextTime - Math.min(frameDur, renderDt) / 2) return;

    // after a stall, skip the missed slots instead of capturing a burst of frames
    const missed = Math.max(0, Math.round((t - nextTime) / frameDur));
    const ts = nextTime + missed * frameDur;
    nextTime = ts + frameDur;

    droppedRenderStall += missed;
    if (pending) droppedEncoderBusy++;
    outDropped.set(droppedRenderStall + droppedEncoderBusy);
    if (pending) return;

    pending = source.add(ts, frameDur)
        .then(() =>
        {
            pending = null;
            frames++;
            lastTs = ts;
            outFrames.set(frames);
            outDuration.set(ts);
        })
        .catch(fail);
}

function stop()
{
    if (state != "recording") return;
    setState("stopping");

    Promise.resolve(pending)
        .then(() => { return output.finalize(); })
        .then(() =>
        {
            revokeUrl();
            blobUrl = URL.createObjectURL(new Blob([output.target.buffer], { "type": output.format.mimeType }));

            outReport.setRef(
            {
                "recordedFrames": frames,
                "droppedFrames": droppedEncoderBusy + droppedRenderStall,
                "droppedEncoderBusy": droppedEncoderBusy,
                "droppedRenderStall": droppedRenderStall,
                "duration": lastTs + 1 / recFps,
                "fps": recFps,
                "startupEncodeMs": startupMs,
                "codec": inCodec.get(),
                "container": inContainer.get(),
                "quality": inQuality.get(),
                "width": recWidth,
                "height": recHeight,
                "bytes": output.target.buffer.byteLength,
                "mimeType": output.format.mimeType
            });

            setState("idle");
            output = source = null;
            outRecording.set(false);
            outUrl.set(blobUrl);
            outFinished.trigger();
        })
        .catch(fail);
}

function fail(e)
{
    op.logError(e);
    setError("Recording failed: " + (e.message || e));
    if (output && output.state != "canceled" && output.state != "finalized") output.cancel();
    output = source = pending = null;
    setState("idle");
    outRecording.set(false);
}

function revokeUrl()
{
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    blobUrl = null;
}
