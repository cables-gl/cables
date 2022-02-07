const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

// input ports
const audioBufferPort = op.inObject("Audio Buffer");
const playPort = op.inValueBool("Start / Stop", false);
const startTimePort = op.inValue("Start Time", 0);
const stopTimePort = op.inValue("Stop Time", 0);
const offsetPort = op.inValue("Offset", 0);
const autoPlayPort = op.inValueBool("Autoplay", false);
const loopPort = op.inValueBool("Loop", false);
const detunePort = op.inValue("Detune", 0);
const inResetStart = op.inTriggerButton("Restart");
const playbackRatePort = op.inValue("Playback Rate", 1);

// output ports
const audioOutPort = op.outObject("Audio Out");
const outEnded = op.outBool("Finished", false);

// vars
let source = null;

// change listeners
audioBufferPort.onChange = function ()
{
    createAudioBufferSource();
    outEnded.set(false);
    if (
        (autoPlayPort.get() && audioBufferPort.get()) ||
    (playPort.get() && audioBufferPort.get())
    )
    {
        start(startTimePort.get());
    }
};
playPort.onChange = function ()
{
    if (source)
    {
        if (playPort.get())
        {
            const startTime = startTimePort.get() || 0;
            start(startTime);
            outEnded.set(false);
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
            stop(0);
            setTimeout(function ()
            {
                start(0);
            }, 30);
        }
    }
};
// functions
function createAudioBufferSource()
{
    if (source)stop(0);
    source = audioCtx.createBufferSource();
    const buffer = audioBufferPort.get();
    if (buffer)
    {
        source.buffer = buffer;
    }
    source.onended = onPlaybackEnded;
    source.loop = loopPort.get();
    setPlaybackRate();
    setDetune();
    audioOutPort.set(source);
}

function start(time)
{
    try
    {
        source.start(time, offsetPort.get()); // 0 = now
    }
    catch (e)
    {
        op.logError(e);
    } // already playing!?
}

function stop(time)
{
    try
    {
        source.stop(time); // 0 = now
    }
    catch (e)
    {
        op.logError(e);
    } // not playing!?
}

function onPlaybackEnded()
{
    outEnded.set(true);
    createAudioBufferSource(); // we can only play back once, so we need to create a new one
}
