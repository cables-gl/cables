const DEFAULT_DEVICE = "Default";
const NO_DEVICE = "None";
const NO_MIC_ERROR = "No microphone found";

let microphone = null;
let micStream = null;
let devices = [];
let startId = 0;
let status = "";
const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

const inInputDevices = op.inDropDown("Audio Input", [DEFAULT_DEVICE], DEFAULT_DEVICE);
const inGain = op.inFloatSlider("Volume", 1);
const inMute = op.inBool("Mute", false);
const audioOut = op.outObject("Audio Out", null, "audioNode");
const inInit = op.inTriggerButton("Start");
const recording = op.outBoolNum("Listening", false);
const outDevices = op.outArray("List of Input Devices");
const outError = op.outString("Error", "");

op.setPortGroup("Volume Settings", [inGain, inMute]);
recording.ignoreValueSerialize = true;
outError.ignoreValueSerialize = true;

const gainNode = audioCtx ? audioCtx.createGain() : null;

function showError(text)
{
    outError.set(text || "");
    op.setUiError("micError", text || null, 2);
    updateTitle();
}

function setStatus(text)
{
    status = text;
    updateTitle();
}

function isSuspended()
{
    return audioCtx && audioCtx.state == "suspended" && recording.get();
}

function updateTitle()
{
    let title = status;
    if (isSuspended()) title = "paused by browser";
    if (outError.get()) title = outError.get();
    op.setUiAttrib({ "extendTitle": title });
}

function errorText(e)
{
    if (!e) return "unknown microphone error";
    if (e.name == "NotAllowedError") return "Microphone access was denied, allow it in the browser or system settings";
    if (e.name == "NotFoundError") return NO_MIC_ERROR;
    if (e.name == "NotReadableError") return "The microphone could not be opened, it may be disabled or used exclusively by another app";
    if (e.name == "OverconstrainedError") return "The selected audio input is not available anymore";
    if (e.name == "SecurityError") return "Microphone access is blocked, the page needs to be served via https";
    return "microphone error: " + (e.message || e.name || String(e));
}

function hasMediaDevices()
{
    return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
}

function stopStream()
{
    if (microphone) microphone.disconnect();
    microphone = null;
    if (micStream) stopTracks(micStream);
    micStream = null;
    recording.set(false);
    setStatus("stopped");
}

function stopTracks(stream)
{
    const tracks = stream.getTracks();
    for (let i = 0; i < tracks.length; i++) tracks[i].stop();
}

// "None" was the default of older patches, it means the system input as well
function isDefaultDevice(label)
{
    return !label || label == DEFAULT_DEVICE || label == NO_DEVICE;
}

function findDevice(label)
{
    if (isDefaultDevice(label)) return null;
    for (let i = 0; i < devices.length; i++)
        if (devices[i].label == label) return devices[i];
    return null;
}

function updateGain()
{
    if (!gainNode) return;
    const gain = inMute.get() ? 0 : Number(inGain.get()) || 0;
    gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
}

// browsers keep a new audio context suspended until the user interacts with the page, nothing would be heard without resuming it
function resumeAudio()
{
    if (!audioCtx || audioCtx.state != "suspended") return;
    audioCtx.resume().catch((e) => { op.setUiError("suspended", "audio could not be resumed: " + e.message, 1); });
}

function updateSuspendedWarning()
{
    if (isSuspended()) op.setUiError("suspended", "audio is paused by the browser until the page is clicked", 1);
    else op.setUiError("suspended", null);
    updateTitle();
}

function onUserGesture()
{
    resumeAudio();
}

if (audioCtx) audioCtx.addEventListener("statechange", updateSuspendedWarning);
document.addEventListener("pointerdown", onUserGesture);
document.addEventListener("keydown", onUserGesture);

inGain.onChange = updateGain;
inMute.onChange = updateGain;

inInit.onTriggered = () =>
{
    if (!audioCtx) return showError("Web audio is not supported in this browser");
    if (!hasMediaDevices()) return showError("Microphone access is not available, the page needs to be served via https");

    resumeAudio();
    stopStream();
    showError(null);

    const label = inInputDevices.get();
    const device = findDevice(label);
    if (!device && !isDefaultDevice(label)) op.setUiError("deviceNotFound", "audio input \"" + label + "\" not found, using the default input", 1);
    else op.setUiError("deviceNotFound", null);

    const constraints = { "audio": device ? { "deviceId": { "exact": device.deviceId } } : true };
    const id = ++startId;
    setStatus("starting");

    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) =>
        {
            if (id != startId) return stopTracks(stream);

            micStream = stream;
            microphone = audioCtx.createMediaStreamSource(stream);
            microphone.connect(gainNode);
            audioOut.setRef(gainNode);
            recording.set(true);
            op.setUiError("devicesLoaded", null);
            setStatus("listening");
            updateSuspendedWarning();

            const tracks = stream.getAudioTracks();
            for (let i = 0; i < tracks.length; i++)
                tracks[i].addEventListener("ended", () =>
                {
                    if (stream != micStream) return;
                    stopStream();
                    showError("The microphone was disconnected");
                });
        })
        .catch((e) =>
        {
            if (id != startId) return;
            recording.set(false);
            showError(errorText(e));
        });
};

// asks for microphone access first, the device labels are empty without it
function loadDevices()
{
    if (!hasMediaDevices()) return showError("microphone access is not available, the page needs to be served via https");

    const loadingId = op.patch.loading.start("MIC inputs", "", op);
    if (!recording.get()) setStatus("loading devices");
    navigator.mediaDevices.getUserMedia({ "audio": true })
        .then((stream) =>
        {
            stopTracks(stream);
            return navigator.mediaDevices.enumerateDevices();
        })
        .then(setDevices)
        .catch(showDeviceError)
        .finally(() => { op.patch.loading.finished(loadingId); });
}

function setDevices(allDevices)
{
    devices = [];
    for (let i = 0; i < allDevices.length; i++)
        if (allDevices[i].kind == "audioinput") devices.push({ "label": allDevices[i].label || "microphone " + (devices.length + 1), "deviceId": allDevices[i].deviceId });

    const labels = devices.map((d) => { return d.label; });
    inInputDevices.uiAttribs.values = [DEFAULT_DEVICE].concat(labels);
    outDevices.setRef(labels);
    if (!recording.get()) setStatus("ready");
    if (!devices.length) showError(NO_MIC_ERROR);
    else if (outError.get() == NO_MIC_ERROR) showError(null);
    if (devices.length && !recording.get()) op.setUiError("devicesLoaded", "Input devices have been loaded. Click \"Start\" to activate the microphone input, \"Default\" uses the input selected in the system settings.", 0);
    op.refreshParams();
}

function showDeviceError(e)
{
    outDevices.setRef(null);
    showError(errorText(e));
    op.refreshParams();
}

// microphones plugged in or removed while the patch runs, access was already asked for by loadDevices
function onDeviceChange()
{
    navigator.mediaDevices.enumerateDevices().then(setDevices).catch(showDeviceError);
}

op.onDelete = () =>
{
    startId++;
    stopStream();
    document.removeEventListener("pointerdown", onUserGesture);
    document.removeEventListener("keydown", onUserGesture);
    if (audioCtx) audioCtx.removeEventListener("statechange", updateSuspendedWarning);
    if (hasMediaDevices()) navigator.mediaDevices.removeEventListener("devicechange", onDeviceChange);
};

if (hasMediaDevices()) navigator.mediaDevices.addEventListener("devicechange", onDeviceChange);
loadDevices();
