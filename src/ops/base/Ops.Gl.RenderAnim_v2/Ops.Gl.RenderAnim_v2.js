const
    exec = op.inTrigger("Render"),
    next = op.outTrigger("Next"),
    inType = op.inDropDown("File Type", ["PNG", "JPG", "WebP", "WebM"], "PNG"),
    inZip = op.inBool("ZIP multiple files", false),
    inFilePrefix = op.inString("Filename", "cables"),
    inQuality = op.inFloatSlider("Quality", 0.8),
    inDurType = op.inSwitch("Duration Type", ["Seconds", "Frames"], "Seconds"),
    inDuration = op.inInt("Duration", 1),
    inFps = op.inInt("FPS", 30),
    inTransparency = op.inValueBool("Transparency", false),
    useCanvasSize = op.inValueBool("Use Canvas Size", true),
    inWidth = op.inValueInt("texture width", 512),
    inHeight = op.inValueInt("texture height", 512),
    inStart = op.inTriggerButton("Start"),
    outProgress = op.outNumber("Progress", 0),
    outFrame = op.outNumber("Frame", 0),
    outStatus = op.outString("Status", "Waiting"),
    outStarted = op.outBool("Started"),
    outFinished = op.outTrigger("Finished");

op.setPortGroup("File", [inType, inFilePrefix, inQuality]);
op.setPortGroup("Size", [useCanvasSize, inWidth, inHeight]);
op.setPortGroup("Timing", [inFps, inDurType, inDuration]);

exec.onTriggered = render;

let started = false;
let countFrames = 0;
const finished = true;
let fps = 30;
let numFrames = 31;

const cycle = false;
let shortId = CABLES.shortId();
let frameStarted = false;
const frames = [];
let lastFrame = -1;
let time = 0;

let filenamePrefix = "";

let zip = null;

let oldSizeW = op.patch.cgl.canvasWidth;
let oldSizeH = op.patch.cgl.canvasHeight;

inType.onChange = updateQuality;
useCanvasSize.onChange = updateSize;

updateQuality();
updateSize();

function updateQuality()
{
    inQuality.setUiAttribs({ "greyout": inType.get() == "PNG" });
}

function updateSize()
{
    inWidth.setUiAttribs({ "greyout": useCanvasSize.get() });
    inHeight.setUiAttribs({ "greyout": useCanvasSize.get() });
}

inStart.onTriggered = function ()
{
    filenamePrefix = inFilePrefix.get();
    console.log("pref", filenamePrefix);
    frames.length = 0;
    outStatus.set("Starting");
    fps = inFps.get();
    numFrames = inDuration.get() * fps;
    if (inDurType.get() == "Frames")numFrames = inDuration.get();
    shortId = CABLES.shortId();
    updateTime();

    if (inZip.get()) zip = new JSZip();

    if (!useCanvasSize.get())
    {
        oldSizeW = CABLES.patch.cgl.canvasWidth;
        oldSizeH = CABLES.patch.cgl.canvasHeight;
        op.patch.cgl.setSize(inWidth.get(), inHeight.get());
        op.patch.cgl.updateSize();
    }

    if (numFrames == 0)
    {
        countFrames = 0;
        started = true;
    }
    else
    {
        countFrames = -20;
        started = true;
        lastFrame = -9999;
    }
};

function updateTime()
{
    if (numFrames >= 0)
    {
        time = Math.max(0, countFrames * (1.0 / fps));
        op.patch.timer.setTime(time);
        CABLES.overwriteTime = time;// - 1 / fps;
        op.patch.freeTimer.setTime(time);
    }
}

function stopRendering()
{
    started = false;
    CABLES.overwriteTime = undefined;
    outStatus.set("Finished");
}

function render()
{
    outStarted.set(started);

    if (!started)
    {
        next.trigger();
        return;
    }

    const oldInternalNow = CABLES.internalNow;

    if (started)
    {
        CABLES.internalNow = function ()
        {
            return time * 1000;
        };

        updateTime();
        // CABLES.overwriteTime = time;
        // op.patch.timer.setTime(time);
        // op.patch.freeTimer.setTime(time);
    }

    if (lastFrame == countFrames)
    {
        next.trigger();
        return;
    }

    lastFrame = countFrames;

    let prog = countFrames / numFrames;
    if (prog < 0.0) prog = 0.0;
    outProgress.set(prog);
    outFrame.set(countFrames);

    next.trigger();

    CABLES.internalNow = oldInternalNow;

    frameStarted = false;
    if (countFrames > numFrames)
    {
        console.log("FINISHED...");
        console.log("ffmpeg -y -framerate 30 -f image2 -i " + filenamePrefix + "_%d.png  -b 9999k -vcodec mpeg4 " + shortId + ".mp4");

        if (!useCanvasSize.get())
        {
            op.patch.cgl.setSize(oldSizeW, oldSizeH);
            op.patch.cgl.updateSize();
        }

        if (zip)
        {
            zip.generateAsync({ "type": "blob" })
                .then(function (blob)
                {
                    const anchor = document.createElement("a");
                    anchor.download = filenamePrefix + ".zip";
                    anchor.href = URL.createObjectURL(blob);
                    anchor.click();
                    stopRendering();
                    outFinished.trigger();
                });
        }
        else
        if (inType.get() == "WebM")
        {
            try
            {
                outStatus.set("Creating Video File from frames");
                console.log("webm frames", frames.length);

                const video = Whammy.fromImageArray(frames, fps);
                const url = window.URL.createObjectURL(video);
                const anchor = document.createElement("a");

                anchor.setAttribute("download", filenamePrefix + ".webm");
                anchor.setAttribute("href", url);
                document.body.appendChild(anchor);
                anchor.click();
                stopRendering();
                outFinished.trigger();
            }
            catch (e)
            {
                console.error(e);
            }

            frames.length = 0;
        }
        else
            stopRendering();

        return;
    }

    let mimetype = "image/png";
    let suffix = "png";

    if (inType.get() == "JPG")
    {
        mimetype = "image/jpeg";
        suffix = "jpg";
    }
    else if (inType.get() == "WebP")
    {
        mimetype = "image/webp";
        suffix = "webp";
    }

    if (countFrames > 0)
    {
        outStatus.set("Rendering Frame " + countFrames + " of " + numFrames);
        console.log("Rendering Frame " + countFrames + " of " + numFrames, time);
        if (inType.get() == "WebM")
        {
            frames.push(op.patch.cgl.canvas.toDataURL("image/webp", inQuality.get()));
            countFrames++;
            updateTime();
        }
        else
        {
            console.log("screenshotting frame...", countFrames);
            op.patch.cgl.screenShot((blob) =>
            {
                if (blob)
                {
                    if (zip)
                    {
                        let filename = filenamePrefix + "_" + countFrames + "." + suffix;

                        zip.file(filename, blob, { "base64": false });
                        countFrames++;
                        updateTime();
                    }
                    else
                    {
                        let filename = filenamePrefix + "_" + shortId + "_" + countFrames + "." + suffix;

                        const anchor = document.createElement("a");
                        anchor.download = filename;
                        anchor.href = URL.createObjectURL(blob);

                        setTimeout(() =>
                        {
                            anchor.click();
                            countFrames++;
                            updateTime();
                        }, 200);
                    }
                }
                else
                {
                    Log.log("screenshot: no blob");
                }
            }, !inTransparency.get(), mimetype, inQuality.get());
        }
    }
    else
    {
        outStatus.set("Prerendering...");
        console.log("pre ", countFrames, time);
        op.patch.cgl.screenShot((blob) =>
        {
            countFrames++;
            updateTime();
        });
    }
}
