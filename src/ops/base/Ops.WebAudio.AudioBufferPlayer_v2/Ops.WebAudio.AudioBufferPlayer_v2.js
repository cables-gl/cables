const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

// input ports
const audioBufferPort = op.inObject("Audio Buffer");
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
const audioOutPort = op.outObject("Audio Out");
const outPlaying = op.outBool("Is Playing", false);
// vars
let source = null;
let isPlaying = false;
let hasEnded = false;
let pausedAt = null;
let startedAt = null;

let gainNode = audioCtx.createGain();

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
    if (audioBufferPort.get())
    {
        if (!(audioBufferPort.get() instanceof AudioBuffer))
        {
            op.setUiError("noAudioBuffer", "The passed object is not an AudioBuffer. You have to pass an AudioBuffer to be able to play back sound.", 2);
            return;
        }

        op.setUiError("noAudioBuffer", null);

        createAudioBufferSource();

        if (
            (autoPlayPort.get() && audioBufferPort.get()) ||
        (playPort.get() && audioBufferPort.get())
        )
        {
            start(startTimePort.get(), offsetPort.get());
        }
    }
    else
    {
        op.setUiError("noAudioBuffer", null);

        if (isPlaying)
        {
            stop(0);
            setTimeout(function ()
            {
                if (isPlaying) source.stop();
                if (source) source.disconnect();
                source = null;
            }, 30);
        }
        else
        {
            if (source)
            {
                source.disconnect();
                source = null;
            }
        }
    }
};
playPort.onChange = function ()
{
    if (source)
    {
        if (playPort.get())
        {
            const startTime = startTimePort.get() || 0;
            createAudioBufferSource();
            start(startTime);
        }
        else
        {
            const stopTime = stopTimePort.get() || 0;
            stop(stopTime);
        }
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
    if (source)
    {
        const detune = detunePort.get() || 0;
        if (source.detune)
        {
            source.detune.setValueAtTime(
                detune,
                audioCtx.currentTime
            );
        }
    }
}

playbackRatePort.onChange = setPlaybackRate;

function setPlaybackRate()
{
    if (source)
    {
        const playbackRate = playbackRatePort.get() || 0;
        if (playbackRate >= source.playbackRate.minValue && playbackRate <= source.playbackRate.maxValue)
        {
            source.playbackRate.setValueAtTime(
                playbackRate,
                audioCtx.currentTime
            );
        }
    }
}

let resetTriggered = false;
inResetStart.onTriggered = function ()
{
    if (source)
    {
        if (playPort.get())
        {
            if (isPlaying)
            {
                stop(0);
                resetTriggered = true;
            }
            else
            {
                start(0);
            }
        }
    }
};

// functions
function createAudioBufferSource()
{
    if (source)
    {
        stop(0);
        source.disconnect(gainNode);
    }
    source = audioCtx.createBufferSource();
    const buffer = audioBufferPort.get();

    if (buffer)
    {
        source.buffer = buffer;
    }

    source.onended = onPlaybackEnded;
    source.loop = loopPort.get();
    if (!gainNode) gainNode = audioCtx.createGain();
    source.connect(gainNode);

    setPlaybackRate();
    setDetune();
    audioOutPort.set(gainNode);

    if (resetTriggered)
    {
        start(0);
        resetTriggered = false;
    }
}

let timeOuting = false;
let timerId = null;

function start(time)
{
    try
    {
        if (offsetPort.get() > source.buffer.duration)
        {
            op.setUiError("offsetTooLong", "Your offset value is higher than the total time of your audio file. Please decrease the duration to be able to hear sound when playing back your buffer.", 1);
        }
        else
        {
            op.setUiError("offsetTooLong", null);
        }

        source.start(time, offsetPort.get()); // 0 = now

        isPlaying = true;
        hasEnded = false;
        outPlaying.set(true);
    }
    catch (e)
    {
        op.log("Error on start: ", e);
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
}

function onPlaybackEnded()
{
    outPlaying.set(false);
    isPlaying = false;
    hasEnded = true;

    createAudioBufferSource(); // we can only play back once, so we need to create a new one
}

op.onDelete = () =>
{
    if (source)
    {
        source.disconnect();
        source = null;
    }
};

audioOutPort.onLinkChanged = () =>
{
    if (!audioOutPort.isLinked())
    {
        if (source) source.disconnect();
        return;
    }

    if (audioBufferPort.isLinked())
    {
        if (!source) createAudioBufferSource();
        else
        {
            source.connect(gainNode);
        }
    }
};
