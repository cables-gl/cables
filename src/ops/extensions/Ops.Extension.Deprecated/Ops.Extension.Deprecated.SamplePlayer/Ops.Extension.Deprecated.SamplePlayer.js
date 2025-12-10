function clamp(value, min, max)
{
    return Math.min(Math.max(value, min), max);
}

const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

// input ports
const audioBufferPort = op.inObject("Audio Buffer", null, "audioBuffer");
const inTrigger = op.inTriggerButton("Play Sample");
const inTriggerStop = op.inTriggerButton("Stop Playback");
const offsetPort = op.inValue("Offset", 0);
const maxSamples = op.inInt("Buffer Size", 32);
const playbackRatePort = op.inValue("Playback Rate", 1);
const detunePort = op.inValue("Detune", 0);

op.setPortGroup("Time Controls", [offsetPort]);
op.setPortGroup("Miscellaneous", [playbackRatePort, detunePort]);
// output ports
const audioOutPort = op.outObject("Audio Out", null, "audioNode");
const outPlaying = op.outBool("Is Playing", false);

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

// vars
let isPlaying = false;

const gainNode = audioCtx.createGain();

let sourceSize = maxSamples.get() || 32;
let SOURCES = new Array(sourceSize).fill(0).map(() =>
{
    return {
        "bufferSource": audioCtx.createBufferSource(),
        "isPlaying": false,
        "gainNode": audioCtx.createGain(),
        "isGainNodeConnected": false
    };
});
let SOURCES_LENGTH = SOURCES.length;

maxSamples.onChange = () =>
{
    op.setUiError("maxSamples", null);
    if (!maxSamples.get() || maxSamples.get < 1 || maxSamples.get() > 32)
    {
        op.setUiError("maxSamples", "Buffer Size needs to be a number (1-32)");
    }
    sourceSize = maxSamples.get() || 32;
    SOURCES = new Array(sourceSize).fill(0).map(() =>
    {
        return {
            "bufferSource": audioCtx.createBufferSource(),
            "isPlaying": false,
            "gainNode": audioCtx.createGain(),
            "isGainNodeConnected": false
        };
    });
    SOURCES_LENGTH = SOURCES.length;
    currentSample = 0;
    createAudioBufferSources();
};

detunePort.onChange = playbackRatePort.onChange = () =>
{
    op.setUiError("playbackRate", null);
    if (playbackRatePort.get() < 0)
    {
        op.setUiError("playbackRate", "Playback Rate needs to be a positive number");
    }
    try
    {
        SOURCES.forEach((src) =>
        {
        /* playback rate */
            const playbackRate = clamp(playbackRatePort.get(), 0.01, 4);
            if (
                playbackRate >= src.bufferSource.playbackRate.minValue
            && playbackRate <= src.bufferSource.playbackRate.maxValue
            )
            {
                src.bufferSource.playbackRate.setValueAtTime(
                    playbackRate,
                    audioCtx.currentTime + 0.01
                );
            }

            /* detune */
            const detune = detunePort.get();
            if (src.bufferSource.detune)
            {
                src.bufferSource.detune.setValueAtTime(
                    detune,
                    audioCtx.currentTime + 0.01
                );
            }
        });
    }
    catch (e)
    {
        op.log("err in param change", e);
    }
};

function createAudioBufferSources()
{
    const buffer = audioBufferPort.get();
    if (!buffer) return;

    for (let i = 0; i < SOURCES_LENGTH; i += 1)
    {
        const src = SOURCES[i];
        createSingleSource(src);
    }

    audioOutPort.set(gainNode);
}

function createSingleSource(src)
{
    const buffer = audioBufferPort.get();
    if (!buffer) return;
    if (src.isPlaying) return;

    if (src.isGainNodeConnected) src.bufferSource.disconnect(src.gainNode);

    src.bufferSource = audioCtx.createBufferSource();

    /* end callback */
    src.bufferSource.onended = () =>
    {
        src.isPlaying = false;
        outPlaying.set(SOURCES.some((src) => { return src.isPlaying === true; }));
        createSingleSource(src);
    };

    src.bufferSource.buffer = buffer;
    src.bufferSource.loop = false;

    /* playback rate */
    const playbackRate = clamp(playbackRatePort.get(), 0.01, 4);
    if (
        playbackRate >= src.bufferSource.playbackRate.minValue
        && playbackRate <= src.bufferSource.playbackRate.maxValue
    )
    {
        src.bufferSource.playbackRate.setValueAtTime(
            playbackRate,
            audioCtx.currentTime
        );
    }

    /* detune */
    const detune = detunePort.get();
    if (src.bufferSource.detune)
    {
        src.bufferSource.detune.setValueAtTime(
            detune,
            audioCtx.currentTime
        );
    }

    src.bufferSource.connect(src.gainNode);
    src.gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    src.gainNode.connect(gainNode);
    src.isGainNodeConnected = true;
}

let currentSample = 0;
inTrigger.onTriggered = () =>
{
    if (!maxSamples.get() || maxSamples.get < 1 || maxSamples.get() > 32) return;
    if (playbackRatePort.get() < 0) return;

    if (!audioBufferPort.get() || !(audioBufferPort.get() instanceof AudioBuffer)) return;
    try
    {
        const time = 0;
        const offset = Number(offsetPort.get());

        if (!SOURCES[currentSample].isPlaying)
        {
            SOURCES[currentSample].bufferSource.start(Math.max(0, time), Math.max(0, offset));
            SOURCES[currentSample].gainNode.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 0.01);
            SOURCES[currentSample].isPlaying = true;
            outPlaying.set(true);
        }

        currentSample += 1;
        currentSample %= SOURCES_LENGTH;
    }
    catch (e)
    {
        op.setUiError(e);
        op.log("Error: ", e);
        outPlaying.set(false);
    }
};

inTriggerStop.onTriggered = () =>
{
    SOURCES.forEach((src, index) =>
    {
        if (src.isPlaying && src.bufferSource) src.bufferSource.stop();
        src.isPlaying = false;
    });
    outPlaying.set(false);
};

inTrigger.onLinkChanged = () =>
{
    if (!inTrigger.isLinked())
    {
        SOURCES.forEach((src, index) =>
        {
            if (src.isPlaying && src.bufferSource) src.bufferSource.stop();
            src.isPlaying = false;
        });
        outPlaying.set(false);
    }
};
// change listeners
audioBufferPort.onChange = function ()
{
    if (audioBufferPort.get())
    {
        if ((audioBufferPort.get() instanceof AudioBuffer))
        {
            createAudioBufferSources();
        }
    }
    else
    {
        SOURCES.forEach((src) =>
        {
            if (src.bufferSource && src.isGainNodeConnected)
            {
                src.bufferSource.disconnect(src.gainNode);
                src.gainNode.disconnect(gainNode);
                src.isGainNodeConnected = false;
            }
            src.bufferSource = null;
        });

        outPlaying.set(false);
    }
};
