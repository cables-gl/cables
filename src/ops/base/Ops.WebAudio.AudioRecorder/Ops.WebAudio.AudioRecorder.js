// inspired by: https://github.com/kaliatech/web-audio-recording-tests/blob/master/src/shared/RecorderService.js

const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

const inAudio = op.inObject("Audio In", null, "audioNode");
const inStartRecording = op.inTriggerButton("Start Recording");
const inStopRecording = op.inTriggerButton("Stop Recording");
const inRecordGain = op.inFloatSlider("Input Gain", 1);
op.setPortGroup("Recording", [inStartRecording, inStopRecording, inRecordGain]);

const inStartPlayback = op.inTriggerButton("Start Playback");
const inStopPlayback = op.inTriggerButton("Stop Playback");
const inClearBuffer = op.inTriggerButton("Clear Buffer");
const inPlaybackGain = op.inFloatSlider("Playback Gain", 1);
const inLoop = op.inBool("Loop Playback", false);
op.setPortGroup("Playback", [inStartPlayback, inStopPlayback, inLoop, inClearBuffer, inPlaybackGain]);
const inDownloadButton = op.inTriggerButton("Download .wav File");

const outOriginal = op.outObject("Audio Out", null, "audioNode");
const outRecorded = op.outObject("Recorded Audio Out", null, "audioNode");
const outIsRecording = op.outBool("Is Recording");
const outIsPlayingBack = op.outBool("Is Playing Back");
const outState = op.outString("State");
const outBuffer = op.outObject("AudioBuffer Out", null, "audioBuffer");
const outDataUrl = op.outString("Data URL");

inDownloadButton.setUiAttribs({ "greyout": true });
outDataUrl.ignoreValueSerialize = true;

const inputGain = audioCtx.createGain();
const outputGain = audioCtx.createGain();

let isIOS = !navigator.hasOwnProperty("MediaRecorder");

const STATES = {
    "RECORDING": "recording",
    "PROCESSING": "processing",
    "READY": "ready",
    "PLAYING": "playing",
    "IDLING": "idling"
};

let state = STATES.IDLING;
outState.set(state);

const inputStream = audioCtx.createMediaStreamDestination();

let mediaRecorder = null;
let fileReader = null;
let blob = null;

if (isIOS)
{
    mediaRecorder = new IOSMediaRecorder(inputStream.stream);
    fileReader = new FileReader();
}
else
{
    mediaRecorder = new MediaRecorder(inputStream.stream);
}

mediaRecorder.addEventListener("dataavailable", (e) =>
{
    blob = e.data;
    if (blob)
    {
        inDownloadButton.setUiAttribs({ "greyout": !blob });
        let reader = new FileReader();
        reader.onload = function (e)
        {
            outDataUrl.set(e.target.result);
        };
        reader.readAsDataURL(blob);
    }

    if (!isIOS)
    {
        e.data.arrayBuffer() // its a blob
            .then((buffer) =>
            {
                arrayBuffer = buffer;
                audioCtx.decodeAudioData(arrayBuffer, (buffer) =>
                {
                    audioBuffer = buffer;
                    outBuffer.set(audioBuffer);
                    createAudioBufferSource();
                });
            })
            .catch((e) => op.log(e));
    }
    else
    {
        fileReader.onload = () =>
        {
            arrayBuffer = fileReader.result;
            audioCtx.decodeAudioData(arrayBuffer, (buffer) =>
            {
                audioBuffer = buffer;
                outBuffer.set(audioBuffer);
                createAudioBufferSource();
            });
        };
        fileReader.readAsArrayBuffer(e.data);
    }
});

let oldAudioIn = null;

let isRecording = false;
let isPlayingBack = false;
let bufferReady = false;

inStartRecording.onTriggered = () =>
{
    switch (state)
    {
    case STATES.RECORDING:
        return;
    case STATES.PROCESSING:
        return;
    case STATES.PLAYING:
        return;
    case STATES.READY:
        break;
    case STATES.IDLING:
        break;
    }

    if (!inAudio.get())
    {
        op.setUiError("noAudioInput", "No audio input is connected. Recording aborted.", 2);
        state = STATES.IDLING;
        return;
    }
    op.setUiError("noAudioInput", null);
    op.setUiError("recording", "Recoding audio...", 0);

    mediaRecorder.start();
    state = STATES.RECORDING;

    isRecording = true;
    outIsRecording.set(isRecording);
    outState.set(state);
};

inStopRecording.onTriggered = () =>
{
    switch (state)
    {
    case STATES.RECORDING:
        break;
    case STATES.PROCESSING:
        return;
    case STATES.PLAYING:
        return;
    case STATES.READY:
        return;
    case STATES.IDLING:
        return;
    }

    op.setUiError("recording", null);
    state = STATES.PROCESSING;
    isRecording = false;
    outState.set(state);

    mediaRecorder.stop();
    outIsRecording.set(isRecording);
    op.setUiError("stopRecording", "Recording stopped. Preparing...", 0);
};

inStartPlayback.onTriggered = () =>
{
    switch (state)
    {
    case STATES.RECORDING:
        return;
    case STATES.PROCESSING:
        return;
    case STATES.PLAYING:
        return;
    case STATES.READY:
        break;
    case STATES.IDLING:
        // if (loopSource) break;
        return;
    }

    op.setUiError("readyPlayback", null);
    loopSource.start();
    isPlayingBack = true;
    state = STATES.PLAYING;
    outState.set(state);
    outIsPlayingBack.set(isPlayingBack);
    op.setUiError("playingLoop", "Loop is playing...", 0);
};

inStopPlayback.onTriggered = () =>
{
    switch (state)
    {
    case STATES.RECORDING:
        return;
    case STATES.PROCESSING:
        return;
    case STATES.PLAYING:
        break;
    case STATES.READY:
        return;
    case STATES.IDLING:
        return;
    }

    op.setUiError("playingLoop", null);
    loopSource.stop();
    isPlayingBack = false;
    outIsPlayingBack.set(isPlayingBack);
    state = STATES.IDLING;
    outState.set(state);
    createAudioBufferSource();
};

inPlaybackGain.onChange = () =>
{
    outputGain.gain.linearRampToValueAtTime(inPlaybackGain.get(), audioCtx.currentTime + 0.01);
};

let arrayBuffer = null;
let audioBuffer = null;
let loopSource = null;

inLoop.onChange = () =>
{
    if (loopSource) loopSource.loop = inLoop.get();
};

function createAudioBufferSource()
{
    if (loopSource)
    {
        if (state === STATES.PLAYING)
        {
            loopSource.stop();
            isPlayingBack = false;
            outIsPlayingBack.set(isPlayingBack);
            loopSource.disconnect(outputGain);
        }
    }

    if (!audioBuffer) return;

    loopSource = audioCtx.createBufferSource();
    loopSource.buffer = audioBuffer;

    loopSource.onended = () =>
    {
        if (!state !== STATES.IDLING) createAudioBufferSource();
    };
    loopSource.loop = inLoop.get();

    loopSource.connect(outputGain);
    outRecorded.set(outputGain);
    bufferReady = true;
    state = STATES.READY;
    outState.set(state);
    op.setUiError("stopRecording", null);
}

inClearBuffer.onTriggered = () =>
{
    switch (state)
    {
    case STATES.RECORDING:
        return;
    case STATES.PROCESSING:
        return;
    case STATES.PLAYING:
        op.setUiError("playingLoop", null);
        break;
    case STATES.READY:
        break;
    case STATES.IDLING:
        break;
    }

    if (!audioBuffer) return;

    state = STATES.IDLING;
    outState.set(state);

    if (isPlayingBack)
    {
        loopSource.stop();
        isPlayingBack = false;
        outIsPlayingBack.set(isPlayingBack);
    }

    audioBuffer = null;
    outBuffer.set(audioBuffer);
    blob = null;
    inDownloadButton.setUiAttribs({ "greyout": true });
    outDataUrl.set(null);
};

inDownloadButton.onTriggered = () =>
{
    if (!blob) return;

    const anchor = document.createElement("a");

    anchor.download = "AudioRecorder " + op.id + ".wav";
    anchor.href = URL.createObjectURL(blob);

    setTimeout(function ()
    {
        anchor.click();
    }, 100);
};

inAudio.onLinkChanged = () =>
{
    if (!inAudio.isLinked())
    {
        switch (state)
        {
        case STATES.RECORDING:
            break;
        case STATES.PROCESSING:
            return;
        case STATES.PLAYING:
            return;
        case STATES.READY:
            return;
        case STATES.IDLING:
            return;
        }

        mediaRecorder.stop();
        if (isIOS) mediaRecorder.terminateWorker();
        state = STATES.IDLING;
        outState.set(state);
    }
};

op.onDelete = () =>
{
    switch (state)
    {
    case STATES.RECORDING:
        mediaRecorder.stop();
        break;
    case STATES.PROCESSING:
        break;
    case STATES.PLAYING:
        break;
    case STATES.READY:
        break;
    case STATES.IDLING:
        break;
    }
    if (isIOS) mediaRecorder.terminateWorker();
};

inAudio.onChange = () =>
{
    if (!inAudio.get())
    {
        if (oldAudioIn)
        {
            try
            {
                if (oldAudioIn.disconnect)
                {
                    oldAudioIn.disconnect(inputGain);
                    oldAudioIn.disconnect(inputStream);
                }
            }
            catch (e)
            {
                op.log(e);
            }
        }

        outOriginal.set(null);
    }
    else
    {
        if (inAudio.get().connect)
        {
            inAudio.get().connect(inputGain);
            inAudio.get().connect(inputStream);
        }

        outOriginal.set(inputGain);
    }

    oldAudioIn = inAudio.get();
};

op.onDelete = () =>
{
    if (loopSource)
    {
        loopSource.disconnect();
    }
};
