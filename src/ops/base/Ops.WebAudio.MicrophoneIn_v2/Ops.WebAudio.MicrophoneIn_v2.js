let microphone = null;
const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

const inInit = op.inTriggerButton("Start");
const inInputDevices = op.inValueSelect("Audio Input", ["none"]);
const inGain = op.inFloatSlider("Volume", 0);
const audioOut = op.outObject("audio out");
const recording = op.outValueBool("Listening", false);

function streamAudio(stream)
{
    microphone = audioCtx.createMediaStreamSource(stream);
    audioOut.set(microphone);
    op.log("[microphoneIn] streaming mic audio!", stream, microphone);
    recording.set(true);
}

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
        /*
        navigator.mediaDevices.getUserMedia({ "audio": true })
            .then(function (stream)
            {
                microphone = audioCtx.createMediaStreamSource(stream);
                audioOut.set(microphone);
                op.log("streaming mic audio!", stream, microphone);
                recording.set(true);
            })
            .catch(function (err)
            {
                op.log("[microphoneIn] could not get usermedia promise", err);
                recording.set(false);
            });
            */
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

navigator.mediaDevices.getUserMedia({ "audio": true })
    .then((res) =>
        navigator.mediaDevices.enumerateDevices())
    .then((devices) =>
    {
        const audioInputDevices = devices
            .filter((device) => device.kind === "audioinput")
            .map((deviceInfo, index) => deviceInfo.label || `microphone ${index + 1}`);

        inInputDevices.uiAttribs.values = audioInputDevices;
    })
    .catch((e) => op.log("error", e));
