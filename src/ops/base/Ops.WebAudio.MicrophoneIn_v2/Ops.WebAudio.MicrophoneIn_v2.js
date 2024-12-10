const cgl = op.patch.cgl;

let microphone = null;
const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

const inInputDevices = op.inDropDown("Audio Input", ["None"]);
const inGain = op.inFloatSlider("Volume", 1);
const inMute = op.inBool("Mute", false);
const audioOut = op.outObject("Audio Out", null, "audioNode");
const inInit = op.inTriggerButton("Start");
const recording = op.outBoolNum("Listening", false);
const outDevices = op.outArray("List of Input Devices");

op.setPortGroup("Volume Settings", [inGain, inMute]);
let audioInputsLoaded = false;
let loadingId = null;

const gainNode = audioCtx.createGain();

function streamAudio(stream)
{
    microphone = audioCtx.createMediaStreamSource(stream);
    microphone.connect(gainNode);
    audioOut.set(gainNode);
    op.log("[microphoneIn] streaming mic audio!", stream, microphone);
    recording.set(true);
}

inGain.onChange = () =>
{
    if (inMute.get()) return;
    gainNode.gain.setValueAtTime(Number(inGain.get()) || 0, audioCtx.currentTime);
};

inMute.onChange = () =>
{
    if (inMute.get())
    {
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    }
    else
    {
        gainNode.gain.setValueAtTime(Number(inGain.get()) || 0, audioCtx.currentTime);
    }
};

inInit.onTriggered = function ()
{
    if (!audioCtx)
    {
        op.log("[microphoneIn] no audiocontext!");
        return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    {
        op.log("[microphoneIn] new micro");

        if (audioInputsLoaded)
        {
            op.setUiError("noAudioInputs", null);

            const device = inInputDevices.get();

            if (device === "None")
            {
                recording.set(false);
                op.setUiError("noDeviceSelected", "No audio device selected!", 1);
                return;
            }
            else
            {
                op.setUiError("noDeviceSelected", null);
            }
            const constraints = {
                "audio": { "deviceId": device },
            };

            navigator.mediaDevices.getUserMedia(constraints)
                .then((stream) =>
                {
                    microphone = audioCtx.createMediaStreamSource(stream);
                    microphone.connect(gainNode);
                    audioOut.set(gainNode);
                    op.log("streaming mic audio!", stream, microphone, gainNode);
                    recording.set(true);
                    op.setUiError("devicesLoaded", null);
                })
                .catch((e) =>
                {
                    op.log("ERROR STREAMNG", e);
                });
        }
        else
        {
            op.setUiError("noAudioInputs", "There are no audio inputs to use the MicrophoneIn op with.", 2);
            recording.set(false);
        }
    }
    else
    {
        // old method
        navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.mozGetUserMedia);

        if (navigator.getUserMedia)
        {
            navigator.getUserMedia(
                { "audio": true },
                streamAudio,
                function (e)
                {
                    op.log("[microphoneIn]No live audio input " + e);
                    recording.set(false);
                }
            );
        }
        else
        {
            op.log("[op microphone] could not get usermedia");
            recording.set(false);
        }
    }
};

/* INIT FUNCTION */
loadingId = cgl.patch.loading.start("MIC inputs", "", op);
navigator.mediaDevices.getUserMedia({ "audio": true })
    .then((res) =>
    { return navigator.mediaDevices.enumerateDevices(); })
    .then((devices) =>
    {
        const audioInputDevices = devices
            .filter((device) => { return device.kind === "audioinput"; })
            .map((deviceInfo, index) => { return deviceInfo.label || `microphone ${index + 1}`; });

        inInputDevices.uiAttribs.values = audioInputDevices;
        op.setUiError("devicesLoaded", "Input devices have been loaded. Please choose a device from the dropdown menu and click the \"Start\" button to activate the microphone input.", 0);
        cgl.patch.loading.finished(loadingId);
        audioInputsLoaded = true;
        outDevices.set(null);
        outDevices.set(audioInputDevices);
    })
    .catch((e) =>
    {
        op.log("error", e);
        cgl.patch.loading.finished(loadingId);
        audioInputsLoaded = false;
    });
