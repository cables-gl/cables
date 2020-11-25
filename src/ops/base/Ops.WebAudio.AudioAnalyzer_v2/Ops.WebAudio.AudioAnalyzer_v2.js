const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const MAX_DBFS_RANGE_24_BIT = -144;
const MAX_DBFS_RANGE_26_BIT = -96;
let audioCtx = null;

if (!window.audioContext) { audioCtx = new AudioContext(); }
else audioCtx = window.audioContext;

const inTrigger = op.inTrigger("Trigger In");

const analyser = audioCtx.createAnalyser();
analyser.smoothingTimeConstant = 0.3;
analyser.fftSize = 256;

const audioIn = op.inObject("Audio In");
const inAnalyserDomain = op.inSwitch("Domain", ["Frequency", "Time"], "Frequency");
const inFFTSize = op.inSwitch("FFT size", [64, 128, 256, 512, 1024, 2048], 256);
const inSmoothing = op.inFloatSlider("Smoothing", 0.3);

const inRangeMin = op.inFloat("Min", -96);
const inRangeMax = op.inFloat("Max", 0);

op.setPortGroup("Inputs", [inTrigger, audioIn]);
op.setPortGroup("FFT Options", [inFFTSize, inAnalyserDomain, inSmoothing]);
op.setPortGroup("Range (in dBFS)", [inRangeMin, inRangeMax]);
const outTrigger = op.outTrigger("Trigger Out");
const audioOut = op.outObject("Audio Out");
const avgVolume = op.outNumber("Average Volume");
const fftOut = op.outArray("FFT"); // op.addOutPort(new CABLES.Port(op, "fft", CABLES.OP_PORT_TYPE_ARRAY));
const fftLength = op.outNumber("FFT Array Length");

let updating = false;

let fftBufferLength = analyser.frequencyBinCount;
let fftDataArray = new Uint8Array(fftBufferLength);
let getFreq = true;
const array = null;
let oldAudioIn = null;

audioIn.onChange = () =>
{
    if (audioIn.get())
    {
        const audioNode = audioIn.get();
        if (audioNode.connect)
        {
            audioNode.connect(analyser);
            audioOut.set(analyser);
            op.setUiError("audioCtx", null);
        }
        else
        {
            op.setUiError("audioCtx", "The passed input is not an audio context. Please make sure you connect an audio context to the input.", 2);
        }
    }
    else
    {
        if (oldAudioIn)
        {
            if (oldAudioIn.disconnect) oldAudioIn.disconnect(analyser);
            audioOut.set(null);
        }
        op.setUiError("audioCtx", null);
    }
    oldAudioIn = audioIn.get();
};

function updateAnalyser()
{
    try
    {
        analyser.smoothingTimeConstant = clamp(inSmoothing.get(), 0.0, 1.0);
        analyser.fftSize = Number(inFFTSize.get());
        const minDecibels = clamp(inRangeMin.get(), MAX_DBFS_RANGE_24_BIT, -0.0001);
        const maxDecibels = Math.max(inRangeMax.get(), analyser.minDecibels + 0.0001);
        analyser.minDecibels = minDecibels;
        analyser.maxDecibels = maxDecibels;

        if (minDecibels < MAX_DBFS_RANGE_24_BIT)
        {
            op.setUiError("maxDbRangeMin",
                "Your minimum is below the lowest possible dBFS value: "
                + MAX_DBFS_RANGE_24_BIT
                + "dBFS. To make sure your analyser data is correct, try increasing the minimum.",
                1
            );
        }
        else
        {
            op.setUiError("maxDbRangeMin", null);
        }

        if (maxDecibels > 0)
        {
            op.setUiError("maxDbRangeMax", "Your maximum is above 0 dBFS. As digital signals only go to 0 dBFS and not above, you should use 0 as your maximum.", 1);
        }
        else
        {
            op.setUiError("maxDbRangeMax", null);
        }
    }
    catch (e)
    {
        op.log(e);
    }
    if (inAnalyserDomain.get() == "Frequency") getFreq = true;
    if (inAnalyserDomain.get() == "Time") getFreq = false;
}

inAnalyserDomain.onChange = inFFTSize.onChange = inSmoothing.onChange
= inRangeMin.onChange = inRangeMax.onChange = () =>
    {
        if (inTrigger.isLinked()) updating = true;
        else updateAnalyser();
    };

inTrigger.onTriggered = function ()
{
    if (updating)
    {
        updateAnalyser();
        updating = false;
    }

    if (fftBufferLength != analyser.frequencyBinCount)
    {
        fftBufferLength = analyser.frequencyBinCount;
        fftDataArray = new Uint8Array(fftBufferLength);
    }

    if (!fftDataArray)
    {
        return;
    }

    let values = 0;

    for (let i = 0; i < fftDataArray.length; i++) values += fftDataArray[i];

    const average = values / fftDataArray.length;

    avgVolume.set(average / 128);
    try
    {
        // TODO: check this method for compatibility etc
        if (getFreq) analyser.getByteFrequencyData(fftDataArray);
        else analyser.getByteTimeDomainData(fftDataArray);
    }
    catch (e) { op.log(e); }

    fftOut.set(null);
    fftOut.set(fftDataArray);
    fftLength.set(fftDataArray.length);
    outTrigger.trigger();
};
