function clamp(value, min, max)
{
  return Math.min(Math.max(value, min), max);
};


const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

// input ports
const audioBufferPort = op.inObject("Audio Buffer");
const inTrigger = op.inTriggerButton("Play Sample");
const startTimePort = op.inValue("Start Time", 0);
const offsetPort = op.inValue("Offset", 0);
const playbackRatePort = op.inValue("Playback Rate", 1);
const detunePort = op.inValue("Detune", 0);

op.setPortGroup("Time Controls", [startTimePort, offsetPort]);
op.setPortGroup("Miscellaneous", [playbackRatePort, detunePort]);
// output ports
const audioOutPort = op.outObject("Audio Out");
const outPlaying = op.outBool("Is Playing", false);
// vars
let source = null;
let isPlaying = false;

const gainNode = audioCtx.createGain();

const SOURCES = [0,1,2,3,4,5,6,7,8,9,10,11].map(() => ({
    bufferSource: audioCtx.createBufferSource(),
    isPlaying: false,
    gainNode: audioCtx.createGain(),
    }));

const SOURCES_LENGTH = SOURCES.length;

SOURCES.forEach((src, index) => {
    src.bufferSource.addEventListener("onended", () => {
        SOURCES[index].isPlaying = false;
        createAudioBufferSource();
    })

    src.bufferSource.connect(src.gainNode);
    src.gainNode.connect(gainNode);
})

let paramsChanged = false;


detunePort.onChange = playbackRatePort.onChange = () => {
    try {
    SOURCES.forEach((src) => {
        /* playback rate */
        const playbackRate = clamp(playbackRatePort.get(), 0.01, 4);
        if (
            playbackRate >= src.bufferSource.playbackRate.minValue
            && playbackRate <= src.bufferSource.playbackRate.maxValue
        ) {
            src.bufferSource.playbackRate.setValueAtTime(
                playbackRate,
                audioCtx.currentTime + 0.01
            );
        }

        /* detune */
        const detune = detunePort.get();
        if (src.bufferSource.detune) {
            src.bufferSource.detune.setValueAtTime(
                detune,
                audioCtx.currentTime + 0.01
            );
        }
    });
    } catch (e) {
        op.log("err in param change", e);
    }
}

function createAudioBufferSource()
{
    const buffer = audioBufferPort.get();
    if (!buffer) return;

    for (let i = 0; i < SOURCES_LENGTH; i += 1) {
        const src = SOURCES[i];
        if (src.isPlaying) continue;

        src.bufferSource.disconnect(src.gainNode);

        src.bufferSource = audioCtx.createBufferSource();

        /* end callback */
        src.bufferSource.onended = () => {
            src.isPlaying = false;
            outPlaying.set(SOURCES.some(src => src.isPlaying === true));
            createAudioBufferSource();
        };

        src.bufferSource.buffer = buffer;
        src.bufferSource.loop = false;
        // TODO: add playback rate & detune

        /* playback rate */
        const playbackRate = clamp(playbackRatePort.get(), 0.01, 4);
        if (
            playbackRate >= src.bufferSource.playbackRate.minValue
            && playbackRate <= src.bufferSource.playbackRate.maxValue
        ) {
            src.bufferSource.playbackRate.setValueAtTime(
                playbackRate,
                audioCtx.currentTime
            );
        }

        /* detune */
        const detune = detunePort.get();
        if (src.bufferSource.detune) {
            src.bufferSource.detune.setValueAtTime(
                detune,
                audioCtx.currentTime
            );
        }

        src.bufferSource.connect(src.gainNode);
        src.gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        src.gainNode.connect(gainNode);
    }

    audioOutPort.set(gainNode);
}

let currentSample = 0;
inTrigger.onTriggered = () => {
    try
    {

        const time = Number(startTimePort.get());
        const offset = Number(offsetPort.get());

        if (!SOURCES[currentSample].isPlaying) {
            SOURCES[currentSample].bufferSource.start(time, offset); // 0 = now
            SOURCES[currentSample].gainNode.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 0.01);
            SOURCES[currentSample].isPlaying = true;
            outPlaying.set(true);
        }

        currentSample += 1;
        currentSample = currentSample % SOURCES_LENGTH;
    }
    catch (e)
    {
        op.setUiError(e);
        op.log("IM IN ERROR?", currentSample,  e);
        outPlaying.set(false);
        isPlaying = false;
    }
}

inTrigger.onLinkChanged = () => {
    if (!inTrigger.isLinked()) {
        SOURCES.forEach((src, index) => {
            if (src.isPlaying) src.bufferSource.stop();
            src.isPlaying = false;
        });
        outPlaying.set(false);
    }
}
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