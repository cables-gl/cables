const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

// input ports
const audioBufferPort = op.inObject("Audio Buffer", null, "audioBuffer");
const playPort = op.inBool("Start / Stop", false);
const autoPlayPort = op.inBool("Autoplay", false);
const loopPort = op.inBool("Loop", false);
const inResetStart = op.inTriggerButton("Restart");
const startTimePort = op.inFloat("Start Time", 0);
const stopTimePort = op.inFloat("Stop Time", 0);
const offsetPort = op.inFloat("Offset", 0);
const playbackRatePort = op.inFloat("Playback Rate", 1);
const detunePort = op.inFloat("Detune", 0);

op.setPortGroup("Playback Controls", [playPort, autoPlayPort, loopPort, inResetStart]);
op.setPortGroup("Time Controls", [startTimePort, stopTimePort, offsetPort]);
op.setPortGroup("Miscellaneous", [playbackRatePort, detunePort]);

// output ports
const audioOutPort = op.outObject("Audio Out", null, "audioNode");
const outPlaying = op.outBool("Is Playing", false);
const outLoading = op.outBool("Loading", false);
const outProgress = op.outNumber("Playback Position", 0.0);

// vars
let source = null;
let isPlaying = false;
let hasEnded = false;
let pausedAt = null;
let startedAt = null;
let isLoading = false;
let playbackStartTime = 0;
let audioAnimationFrame = null;

const gainNode = audioCtx.createGain();

if (!audioBufferPort.isLinked())
{
    op.setUiError("inputNotConnected", "To be able to play back sound, you need to connect an AudioBuffer to this op.", 0);
}
else
{
    op.setUiError("inputNotConnected", null);
}

audioBufferPort.onLinkChanged = () =>
{
    if (!audioBufferPort.isLinked())
    {
        op.setUiError("inputNotConnected", "To be able to play back sound, you need to connect an AudioBuffer to this op.", 0);
    }
    else
    {
        op.setUiError("inputNotConnected", null);
    }
};

if (!audioOutPort.isLinked())
{
    op.setUiError("outputNotConnected", "To be able to hear sound playing, you need to connect this op to an Output op.", 0);
}
else
{
    op.setUiError("outputNotConnected", null);
}

audioOutPort.onLinkChanged = () =>
{
    if (!audioOutPort.isLinked())
    {
        op.setUiError("outputNotConnected", "To be able to hear sound playing, you need to connect this op to an Output op.", 0);
    }
    else
    {
        op.setUiError("outputNotConnected", null);
    }
};

// change listeners
audioBufferPort.onChange = function ()
{
    if (audioBufferPort.get()) createAudioBufferSource(true);
    else
    {
        if (isLoading)
        {
            isLoading = false;
            outLoading.set(isLoading);
        }

        if (isPlaying)
        {
            stop(0);
            source.buffer = null;
            source = null;
        }
    }
};

playPort.onChange = function ()
{
    if (!audioBufferPort.get()) return;

    if (!source)
    {
        if (!isLoading) createAudioBufferSource();
    }

    if (playPort.get())
    {
        const startTime = startTimePort.get() || 0;
        start(startTime);
    }
    else
    {
        const stopTime = stopTimePort.get() || 0;
        stop(stopTime);
    }
};

loopPort.onChange = function ()
{
    if (source)
    {
        source.loop = !!loopPort.get();
    }
};

detunePort.onChange = setDetune;

function setDetune()
{
    if (!source) return;

    const detune = detunePort.get() || 0;
    if (source.detune)
    {
        source.detune.setValueAtTime(
            detune,
            audioCtx.currentTime
        );
    }
}

playbackRatePort.onChange = setPlaybackRate;

function setPlaybackRate()
{
    if (!source) return;

    const playbackRate = playbackRatePort.get() || 0;
    if (playbackRate >= source.playbackRate.minValue && playbackRate <= source.playbackRate.maxValue)
    {
        source.playbackRate.setValueAtTime(
            playbackRate,
            audioCtx.currentTime
        );
    }
}

let resetTriggered = false;
inResetStart.onTriggered = function ()
{
    if (!source) return;
    if (!audioBufferPort.get()) return;
    else
    {
        if (!(audioBufferPort.get() instanceof AudioBuffer)) return;
    }

    if (playPort.get())
    {
        if (isPlaying)
        {
            stop(0);
            resetTriggered = true;
        }
        else
        {
            start(startTimePort.get());
        }
    }
};

// functions
function createAudioBufferSource(startPlayback)
{
    if (isLoading) return;
    if (!(audioBufferPort.get() instanceof AudioBuffer)) return;

    isLoading = true;
    outLoading.set(isLoading);

    if (source)
    {
        if (source.buffer)
        {
            stop(0);
            source.disconnect(gainNode);
            source.buffer = null;
        }

        source = null;
    }

    source = audioCtx.createBufferSource();

    const buffer = audioBufferPort.get();

    if (!buffer)
    {
        isLoading = false;
        outLoading.set(isLoading);
        return;
    }

    source.buffer = buffer;
    source.onended = onPlaybackEnded;
    source.loop = loopPort.get();

    source.connect(gainNode);
    setPlaybackRate();
    setDetune();
    audioOutPort.set(gainNode);

    isLoading = false;
    outLoading.set(isLoading);

    if (resetTriggered && startPlayback)
    {
        start(startTimePort.get());
        resetTriggered = false;
        return;
    }

    if (playPort.get() && startPlayback)
    {
        if (!isPlaying) start(startTimePort.get());
    }
}

let timeOuting = false;
let timerId = null;

offsetPort.onChange = () =>
{
    if (offsetPort.get() >= 0) op.setUiError("offsetNegative", null);
    else
    {
        op.setUiError("offsetNegative", "Offset cannot be negative. Setting to 0.", 1);
    }

    if (source)
    {
        if (source.buffer)
        {
            if (offsetPort.get() > source.buffer.duration)
            {
                op.setUiError("offsetTooLong", "Your offset value is higher than the total time of your audio file. Please decrease the duration to be able to hear sound when playing back your buffer.", 1);
            }
            else
            {
                op.setUiError("offsetTooLong", null);
            }
        }
    }
};

function updatePlaybackProgress(time, startOffset)
{
    const now = Date.now() / 1000;
    const currentTime = (now - playbackStartTime) + time + startOffset;
    outProgress.set(currentTime);
    audioAnimationFrame = requestAnimationFrame(() => updatePlaybackProgress(time, startOffset));
}

function start(time)
{
    try
    {
        if (source)
        {
            const startOffset = Math.max(0, offsetPort.get());
            source.start(time, startOffset); // 0 = now
            outProgress.set(startOffset);
            playbackStartTime = Date.now() / 1000;
            audioAnimationFrame = requestAnimationFrame(() => { updatePlaybackProgress(time, startOffset); });

            isPlaying = true;
            hasEnded = false;
            outPlaying.set(true);
        }
    }
    catch (e)
    {
        op.log("Error on start: ", e.message);
        outPlaying.set(false);

        isPlaying = false;
    }
}

function stop(time)
{
    try
    {
        if (isPlaying && !hasEnded)
        {
            source.stop();
        }

        isPlaying = false;
        outPlaying.set(false);
    }
    catch (e)
    {
        op.setUiError(e);
        outPlaying.set(false);
    }
    cancelAnimationFrame(audioAnimationFrame);
}

function onPlaybackEnded()
{
    cancelAnimationFrame(audioAnimationFrame);
    outPlaying.set(false);
    isPlaying = false;
    hasEnded = true;
    createAudioBufferSource(loopPort.get()); // we can only play back once, so we need to create a new one
}
