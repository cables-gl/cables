const
    inStart = op.inTriggerButton("Start Capture"),
    inStop = op.inTriggerButton("Stop Capture"),
    inVolume = op.inValueFloat("Volume", 1.0),

    outAudioNode = op.outObject("Audio Node"),
    outPermission = op.outString("Permission Status"),
    outError = op.outString("Error");

op.setPortGroup("Controls", [inStart, inStop]);
op.setPortGroup("Settings", [inVolume]);

let stream = null;
let audioCtx = null;
let mediaStreamSource = null;
let gainNode = null;
let permissionCheckInterval = null;

op.onDelete = cleanup;

inStart.onTriggered = () =>
{
    op.log("[DesktopAudio] Start Capture triggered");
    startCapture();
};

inStop.onTriggered = () =>
{
    op.log("[DesktopAudio] Stop Capture triggered");
    cleanup();
};

inVolume.onChange = () =>
{
    if (gainNode && gainNode.gain)
    {
        gainNode.gain.value = inVolume.get();
    }
};

// Periodic check of macOS permission status
const isMac = (typeof process !== "undefined" && process.platform === "darwin") || 
              (typeof navigator !== "undefined" && /Mac/i.test(navigator.platform || navigator.userAgent));
const isWindows = (typeof process !== "undefined" && process.platform === "win32") || 
                  (typeof navigator !== "undefined" && /Win/i.test(navigator.platform || navigator.userAgent));

if (isMac)
{
    permissionCheckInterval = setInterval(checkPermissionStatus, 5000);
}

// Initial check
checkPermissionStatus();

function checkPermissionStatus()
{
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
        catch (e) {}
    }

    if (ipc)
    {
        ipc.invoke("talkerMessage", "getMediaAccessStatus", { "mediaType": "screen" })
            .then((res) =>
            {
                const status = res.data || res;
                outPermission.set(status);
            })
            .catch(() =>
            {
                outPermission.set("unknown");
            });
    }
    else
    {
        outPermission.set("not-electron");
    }
}

function cleanup()
{
    outAudioNode.set(null);
    outError.set("");

    if (stream)
    {
        const tracks = stream.getTracks();
        tracks.forEach((track) => { return track.stop(); });
        stream = null;
    }

    if (mediaStreamSource)
    {
        try { mediaStreamSource.disconnect(); } catch (e) {}
        mediaStreamSource = null;
    }

    if (gainNode)
    {
        try { gainNode.disconnect(); } catch (e) {}
        gainNode = null;
    }
}

function startCapture()
{
    cleanup();

    const handleStream = (s) =>
    {
        op.log("[DesktopAudio] Stream successfully resolved!");
        stream = s;
        outError.set("");

        // Stop the video track immediately to save performance/decoding overhead
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0)
        {
            videoTracks[0].stop();
        }

        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0)
        {
            if (typeof CABLES !== "undefined" && CABLES.WEBAUDIO)
            {
                audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
            }
            else
            {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                if (window.AudioContext)
                {
                    if (!window.audioContext) window.audioContext = new AudioContext();
                    audioCtx = window.audioContext;
                }
            }
            if (audioCtx)
            {
                if (audioCtx.state === "suspended")
                {
                    audioCtx.resume()
                        .catch((re) => { op.error("[DesktopAudio] Failed to resume AudioContext:", re); });
                }

                mediaStreamSource = audioCtx.createMediaStreamSource(stream);
                gainNode = audioCtx.createGain();
                gainNode.gain.value = inVolume.get();
                
                mediaStreamSource.connect(gainNode);
                outAudioNode.set(gainNode);
                op.log("[DesktopAudio] Successfully connected loopback audio stream.");
            }
            else
            {
                outError.set("AudioContext not available");
            }
        }
        else
        {
            outError.set("No audio tracks found in stream");
        }
    };

    const handleError = (e) =>
    {
        op.error("[DesktopAudio] Get Media Error:", e);
        outError.set("Capture Error: " + e.message);
    };

    if (isMac || isWindows)
    {
        op.log(`[DesktopAudio] ${isMac ? "macOS" : "Windows"} loopback requested, calling getDisplayMedia...`);
        navigator.mediaDevices.getDisplayMedia({
            "video": {
                "width": 1,
                "height": 1
            },
            "audio": true
        })
        .then(handleStream)
        .catch(handleError);
    }
    else
    {
        // Fallback for Windows/Linux desktop capture
        let ipc = window.ipcRenderer;
        if (!ipc)
        {
            const electron = op.require("electron");
            if (electron) ipc = electron.ipcRenderer;
        }
        if (!ipc && window.nodeRequire)
        {
            try { ipc = window.nodeRequire("electron").ipcRenderer; } catch (e) {}
        }

        const proceedWithSourceId = (sourceId) =>
        {
            const constraints = {
                "audio": {
                    "mandatory": {
                        "chromeMediaSource": "desktop",
                        "chromeMediaSourceId": sourceId
                    }
                },
                "video": {
                    "mandatory": {
                        "chromeMediaSource": "desktop",
                        "chromeMediaSourceId": sourceId,
                        "minWidth": 1,
                        "maxWidth": 1,
                        "minHeight": 1,
                        "maxHeight": 1
                    }
                }
            };
            op.log("[DesktopAudio] Non-macOS requested, calling getUserMedia...");
            navigator.mediaDevices.getUserMedia(constraints)
                .then(handleStream)
                .catch(handleError);
        };

        if (ipc)
        {
            ipc.invoke("getDesktopCaptureSources", { "types": ["screen"] })
                .then((sources) =>
                {
                    const s = sources.success && sources.data ? sources.data : sources;
                    const primary = s[0] || { "id": "screen:0:0" };
                    proceedWithSourceId(primary.id);
                })
                .catch(handleError);
        }
        else if (op.patch.api)
        {
            op.patch.api.send("getDesktopCaptureSources", { "types": ["screen"] }, (err, sources) =>
            {
                if (err) return handleError(err);
                const s = sources.success && sources.data ? sources.data : sources;
                const primary = s[0] || { "id": "screen:0:0" };
                proceedWithSourceId(primary.id);
            });
        }
        else
        {
            handleError(new Error("Electron IPC not available"));
        }
    }
}
