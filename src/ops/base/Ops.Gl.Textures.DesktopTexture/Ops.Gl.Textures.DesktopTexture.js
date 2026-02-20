const
    inTrigger = op.inTrigger("Render"),
    inActive = op.inBool("Active", true),
    inRefresh = op.inTriggerButton("Refresh Sources"),
    inUpdateSize = op.inTriggerButton("Update Size"),
    inSource = op.inDropDown("Source", ["Select Source"], "Select Source"),

    flip = op.inValueBool("Flip Y", true),
    fps = op.inValueInt("FPS", 12),

    width = op.inValueInt("Requested Width", 200),
    height = op.inValueInt("Requested Height", 720),

    inAsDOM = op.inValueBool("Show HTML Element", false),
    inCss = op.inStringEditor("CSS", "z-index:99999;position:absolute;"),

    next = op.outTrigger("Next"),
    textureOut = op.outTexture("Texture"),
    outRatio = op.outNumber("Ratio"),
    available = op.outBoolNum("Available"),
    outWidth = op.outNumber("Size Width"),
    outHeight = op.outNumber("Size Height"),
    outError = op.outString("Error"),
    outElement = op.outObject("HTML Element");

op.setPortGroup("Texture", [flip, fps, inActive]);
op.setPortGroup("Video Element", [inAsDOM, inCss]);
op.setPortGroup("Source", [inRefresh, inUpdateSize, inSource, width, height]);

op.toWorkPortsNeedToBeLinked(inTrigger);

const cgl = op.patch.cgl;
const videoElement = document.createElement("video");
const eleId = "desktoptexture" + CABLES.uuid();

videoElement.setAttribute("id", eleId);
videoElement.setAttribute("autoplay", "");
videoElement.setAttribute("muted", "");
videoElement.setAttribute("playsinline", "");
videoElement.setAttribute("style", inCss.get());
if (op.patch.cgl.canvas.parentElement) op.patch.cgl.canvas.parentElement.appendChild(videoElement);
outElement.set(videoElement);

const tex = new CGL.Texture(cgl, { "name": "desktoptexture" });
tex.setSize(8, 8);
textureOut.setRef(tex);

let canceled = false;
let sources = [];
let loadingSource = true;
let sourceRatio = 1.0;
let useConstraints = false;

op.onDelete = removeElement;

inAsDOM.onChange =
    inCss.onChange = updateStyle;

inRefresh.onTriggered = refreshSources;
inUpdateSize.onTriggered = () =>
{
    useConstraints = true;
    startCapture();
};

inSource.onChange = () =>
{
    inSource.setUiAttribs({ "invalid": false });
    op.setUiError("sourcemissing", null);
    if (outError.get().indexOf("not found") !== -1) outError.set("");

    useConstraints = false;
    startCapture();
};

width.onChange = () =>
{
    if (loadingSource) return;
    loadingSource = true;
    if (sourceRatio) height.set(Math.round(width.get() / sourceRatio));
    loadingSource = false;
};

height.onChange = () =>
{
    if (loadingSource) return;
    loadingSource = true;
    if (sourceRatio) width.set(Math.round(height.get() * sourceRatio));
    loadingSource = false;
};

inActive.onChange = () =>
{
    startCapture();
};

op.on("loadedValueSet", () =>
{
    loadingSource = false;
    refreshSources();
    setTimeout(() =>
    {
        // console.log("[DesktopTexture] Starting auto-capture after delay");
        startCapture();
    }, 10000);
});

updateStyle();
refreshSources();

function removeElement()
{
    if (videoElement) videoElement.remove();
    stopStream();
}

function updateStyle()
{
    if (!inAsDOM.get()) videoElement.setAttribute("style", "display:none;");
    else videoElement.setAttribute("style", inCss.get());
}

fps.onChange = function ()
{
    if (fps.get() < 0) fps.set(0);
    if (fps.get() > 60) fps.set(60);
    startCapture();
};

function updateTexture()
{
    if (!available.get()) return;

    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex.tex);
    cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, flip.get());

    cgl.gl.texImage2D(cgl.gl.TEXTURE_2D, 0, cgl.gl.RGBA, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, videoElement);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);

    const w = width.get();
    const h = height.get();

    outHeight.set(h);
    outWidth.set(w);

    tex.setSize(w, h);

    outRatio.set(w / h);

    cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, false);

    textureOut.setRef(tex);
}

inTrigger.onTriggered = () =>
{
    if (inActive.get()) updateTexture();
    next.trigger();
};

function refreshSources()
{
    // console.log("[DesktopTexture] refreshSources called");

    let ipc = window.ipcRenderer;
    if (!ipc)
    {
        const electron = op.require("electron");
        if (electron) ipc = electron.ipcRenderer;
    }

    if (!ipc && window.nodeRequire)
    {
        try
        {
            ipc = window.nodeRequire("electron").ipcRenderer;
        }
        catch (e) { console.error("[DesktopTexture] Failed to nodeRequire electron", e); }
    }

    if (!ipc && op.patch.api)
    {
        // console.log("[DesktopTexture] Using patch.api fallback");
        op.patch.api.send("getDesktopCaptureSources", { "types": ["window", "screen"] }, (err, s) =>
        {
            if (err)
            {
                console.error("[DesktopTexture] patch.api error:", err);
                outError.set("Failed to get sources: " + (err.message || err));
                return;
            }
            handleSources(s);
        });
        return;
    }

    if (!ipc)
    {
        console.error("[DesktopTexture] No IPC found (window.ipcRenderer or op.require)");
        outError.set("Electron IPC not available");
        return;
    }

    // console.log("[DesktopTexture] Invoking getDesktopCaptureSources via IPC");
    ipc.invoke("getDesktopCaptureSources", { "types": ["window", "screen"] })
        .then((s) =>
        {
            handleSources(s);
        })
        .catch((e) =>
        {
            console.error("[DesktopTexture] IPC Invoke error:", e);
            outError.set("Failed to get sources: " + e.message);
        });
}

function handleSources(s)
{
    // console.log("[DesktopTexture] handleSources received:", s);
    if (!s)
    {
        console.warn("[DesktopTexture] sources is null/undefined");
        return;
    }

    // handle both raw array and success object
    let sourceList = s;
    if (s.success && s.data) sourceList = s.data;

    if (!Array.isArray(sourceList))
    {
        console.warn("[DesktopTexture] sources is not an array:", sourceList);
        return;
    }

    sources = sourceList;
    const names = sources.map((source) => { return source.name; });
    const currentSource = inSource.get();

    if (currentSource && currentSource !== "Select Source" && !names.includes(currentSource))
    {
        names.push(currentSource);
        inSource.setUiAttribs({ "invalid": true });

        let errorMsg = "Source \"" + currentSource + "\" not found.";
        const displayTitle = op.uiAttribs.title || "Desktop Texture";

        if (op.uiAttribs && op.uiAttribs.comments)
        {
            errorMsg += " Comments: " + op.uiAttribs.comments;
        }
        outError.set(errorMsg);
        op.setUiError("sourcemissing", errorMsg, 1);
    }
    else
    {
        inSource.setUiAttribs({ "invalid": false });
        op.setUiError("sourcemissing", null);
        if (outError.get().indexOf("not found") !== -1) outError.set("");
    }

    inSource.setUiAttribs({ "values": names });
    if (names.length > 0 && (inSource.get() === "Select Source"))
    {
        inSource.set(names[0]);
    }
    op.refreshParams();
}

function stopStream()
{
    if (videoElement.srcObject)
    {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach((track) => { return track.stop(); });
        videoElement.srcObject = null;
    }
}

function startCapture()
{
    // console.log("[DesktopTexture] startCapture called");
    if (!inActive.get())
    {
        canceled = true;
        stopStream();
        available.set(false);
        return;
    }

    const sourceName = inSource.get();
    const source = sources.find((s) => { return s.name === sourceName; });

    if (!source)
    {
        console.warn("[DesktopTexture] startCapture: Source not found", sourceName);
        // outError.set("Source not found");
        return;
    }

    stopStream();
    canceled = false;

    const constraints = {
        "audio": false,
        "video": {
            "mandatory": {
                "chromeMediaSource": "desktop",
                "chromeMediaSourceId": source.id,
                "maxFrameRate": fps.get()
            }
        }
    };

    if (useConstraints)
    {
        constraints.video.mandatory.minWidth = width.get();
        constraints.video.mandatory.maxWidth = width.get();
        constraints.video.mandatory.minHeight = height.get();
        constraints.video.mandatory.maxHeight = height.get();
    }
    else
    {
        // Initial connection constraints
        constraints.video.mandatory.minWidth = width.get();
        constraints.video.mandatory.maxWidth = width.get();
    }

    // console.log("[DesktopTexture] Requesting getUserMedia with constraints:", constraints);
    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) =>
        {
            // console.log("[DesktopTexture] getUserMedia success");
            videoElement.srcObject = stream;
            videoElement.onloadedmetadata = (e) =>
            {
                available.set(true);
                outError.set("");

                const videoTrack = stream.getVideoTracks()[0];
                if (videoTrack)
                {
                    const settings = videoTrack.getSettings();
                    // console.log("[DesktopTexture] Stream settings:", settings);
                    if (settings.width && settings.height)
                    {
                        if (!useConstraints)
                        {
                            sourceRatio = settings.width / settings.height;
                            loadingSource = true;
                            width.set(settings.width);
                            height.set(settings.height);
                            loadingSource = false;
                        }
                    }
                }

                videoElement.play();
                outElement.set(videoElement);
            };
        })
        .catch((e) =>
        {
            console.error("[DesktopTexture] GetUserMedia Error:", e);
            outError.set("GetUserMedia Error: " + e.message);
            op.logError(e);
        });
}
