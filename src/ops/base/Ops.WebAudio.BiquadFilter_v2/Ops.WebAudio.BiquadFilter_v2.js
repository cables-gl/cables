function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}

let audioContext = CABLES.WEBAUDIO.createAudioContext(op);

// default values + min and max
const FREQUENCY_MIN = 10;
const FREQUENCY_MAX = audioContext.sampleRate / 2; // Nyquist frequency.
const Q_MIN = 0.0001;
const Q_MAX = 1000;
const GAIN_MIN = -40;
const GAIN_MAX = 40;

const biquadFilter = audioContext.createBiquadFilter();
const filterNode = audioContext.createBiquadFilter();

const inAudio = op.inObject("Audio In");
const inFilterType = op.inDropDown("Type", ["peaking", "lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass"], "peaking");

const inFrequency = op.inFloat("frequency", 2000);
const inQ = op.inFloat("q", 0.0001);
const inGain = op.inFloat("gain", 0);

const inDetune = op.inInt("detune", 0);

op.setPortGroup("Filter Settings", [inFilterType, inFrequency, inQ, inGain]);
op.setPortGroup("Detune (in cents)", [inDetune]);
const outAudio = op.outObject("Audio Out");

let oldAudioIn = null;
filterNode.type = inFilterType.get();

inAudio.onChange = function ()
{
    if (!inAudio.get())
    {
        if (oldAudioIn)
        {
            try
            {
                if (oldAudioIn.disconnect) oldAudioIn.disconnect(filterNode);
            }
            catch (e)
            {
                op.log(e);
            }
        }
        op.setUiError("audioCtx", null);
        outAudio.set(null);
    }
    else
    {
        if (inAudio.val.connect)
        {
            inAudio.val.connect(filterNode);
            op.setUiError("audioCtx", null);
        }
        else op.setUiError("audioCtx", "The passed input is not an audio context. Please make sure you connect an audio context to the input.", 2);
    }
    oldAudioIn = inAudio.get();
    outAudio.set(filterNode);
};

inFilterType.onChange = () =>
{
    const type = inFilterType.get();
    inGain.setUiAttribs({
        "greyout": ["lowpass", "highpass", "bandpass", "notch", "allpass"].includes(type)
    });

    inQ.setUiAttribs({
        "greyout": ["lowshelf", "highshelf"].includes(type)
    });

    filterNode.type = type;
};

inFrequency.onChange = () =>
{
    const freq = inFrequency.get();
    if (freq)
    {
        if (freq >= FREQUENCY_MIN && freq <= FREQUENCY_MAX)
        {
            filterNode.frequency.setValueAtTime(clamp(freq, FREQUENCY_MIN, FREQUENCY_MAX), audioContext.currentTime);
            op.setUiError("freqRange", null);
        }
        if (freq < FREQUENCY_MIN)
        {
            op.setUiError("freqRange", "The frequency you selected is lower than the possible frequency of " + FREQUENCY_MIN + " Hz.", 1);
        }
        else if (freq > FREQUENCY_MAX)
        {
            op.setUiError("freqRange", "The frequency you selected is higher than the possible frequency of " + FREQUENCY_MAX + " Hz.", 1);
        }
    }
};

inDetune.onChange = () =>
{
    filterNode.detune.setValueAtTime(inDetune.get(), audioContext.currentTime);
};

inQ.onChange = () =>
{
    const q = inQ.get();
    filterNode.Q.setValueAtTime(clamp(q, Q_MIN, Q_MAX), audioContext.currentTime);

    if (q < Q_MIN) op.setUiError("qRange", "Your Q value is below the minimum possible value of " + Q_MIN + ".", 1);
    else if (q > Q_MAX) op.setUiError("qRange", "Your Q value is above the maximum possible value of " + Q_MAX + ".", 1);
    else
    {
        op.setUiError("qRange", null);
    }
};

inGain.onChange = () =>
{
    const gain = inGain.get();
    filterNode.gain.setValueAtTime(clamp(gain, GAIN_MIN, GAIN_MAX), audioContext.currentTime);
    if (gain < GAIN_MIN) op.setUiError("gainRange", "Your gain value is below the minimum possible value of " + GAIN_MIN + " dB.", 1);
    else if (gain > GAIN_MAX) op.setUiError("gainRange", "Your gain value is above the maximum possible value of " + GAIN_MAX + " dB.", 1);
    else
    {
        op.setUiError("gainRange", null);
    }
};
