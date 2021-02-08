const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

// input ports
const audioBufferPort = op.inObject("Audio Buffer");
const playPort = op.inValueBool("Start / Stop", false);
const autoPlayPort = op.inValueBool("Autoplay", false);
const loopPort = op.inValueBool("Loop", false);
const inResetStart = op.inTriggerButton("Restart");
const startTimePort = op.inValue("Start Time", 0);
const stopTimePort = op.inValue("Stop Time", 0);
const offsetPort = op.inValue("Offset", 0);
const playbackRatePort = op.inValue("Playback Rate", 1);
const detunePort = op.inValue("Detune", 0);

op.setPortGroup("Playback Controls", [playPort, autoPlayPort, loopPort, inResetStart]);
op.setPortGroup("Time Controls", [startTimePort, stopTimePort, offsetPort]);
op.setPortGroup("Miscellaneous", [playbackRatePort, detunePort]);
// output ports
const audioOutPort = op.outObject("Audio Out");
const outPlaying = op.outBool("Is Playing", false);
// vars
let source = null;
let isPlaying = false;

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
            start(startTimePort.get());
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
            }, 30);
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

inResetStart.onTriggered = function ()
{
    if (source)
    {
        if (playPort.get())
        {
            if (isPlaying) stop(0);
            setTimeout(function ()
            {
                if (!isPlaying) start(0);
            }, 35);
        }
    }
};

// functions
function createAudioBufferSource()
{
    if (source)
    {
        if (isPlaying)
        {
            stop(0);
        }
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

    source.connect(gainNode);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    setPlaybackRate();
    setDetune();
    audioOutPort.set(gainNode);
}

function start(time)
{
    try
    {
        source.start(time, offsetPort.get()); // 0 = now
        gainNode.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 0.02);
        isPlaying = true;
        outPlaying.set(true);
    }
    catch (e)
    {
        op.setUiError(e);
        outPlaying.set(false);
        isPlaying = false;
    }
}

function stop(time)
{
    try
    {
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
        setTimeout(function ()
        {
            if (isPlaying)
            {
                source.stop();
            }
            isPlaying = false;
            outPlaying.set(false);
        }, 30);
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
    createAudioBufferSource(); // we can only play back once, so we need to create a new one
}
