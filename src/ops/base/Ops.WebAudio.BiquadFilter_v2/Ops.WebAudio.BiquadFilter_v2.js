function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}

const audioContext = CABLES.WEBAUDIO.createAudioContext(op);

// default values + min and max
const FREQUENCY_MIN = 10;
const FREQUENCY_MAX = audioContext.sampleRate / 2; // Nyquist frequency.
const Q_MIN = 0.0001;
const Q_MAX = 1000;
const GAIN_MIN = -40;
const GAIN_MAX = 40;

const filterNode = audioContext.createBiquadFilter();

const inAudio = op.inObject("Audio In", null, "audioNode");
const inFilterType = op.inDropDown("Type", ["peaking", "lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass"], "peaking");

const inFrequency = op.inFloat("Frequency", 2000);
const inQ = op.inFloat("Q", 0.0001);
const inGain = op.inFloat("Gain", 0);

const inDetune = op.inInt("Detune", 0);
const inFrequencyArray = op.inArray("Frequency Array");

op.setPortGroup("Filter Settings", [inFilterType, inFrequency, inQ, inGain]);
op.setPortGroup("Detune (in cents)", [inDetune]);
op.setPortGroup("Filter Response Input", [inFrequencyArray]);
const outAudio = op.outObject("Audio Out", null, "audioNode");
const outMagnitudeResponseArray = op.outArray("Magnitude Response Array");
const outPhaseResponseArray = op.outArray("Phase Response Array");
const responseArraysLength = op.outNumber("Response Arrays Length");

let oldAudioIn = null;
filterNode.type = inFilterType.get();

let oldLength = 0;
let frequencyArray = null;
let phaseResponseArray = null;
let magnitudeResponseArray = null;

function updateFrequencyResponse()
{
    const frequencies = inFrequencyArray.get();

    if (!frequencies) return;

    if (inAudio.get())
    {
        if (oldLength !== frequencies.length)
        {
            frequencyArray = new Float32Array(frequencies);
            phaseResponseArray = new Float32Array(frequencies.length);
            magnitudeResponseArray = new Float32Array(frequencies.length);
            oldLength = frequencies.length;
        }

        if (oldLength)
        {
            filterNode.getFrequencyResponse(frequencyArray, phaseResponseArray, magnitudeResponseArray);

            outMagnitudeResponseArray.set(null);
            outMagnitudeResponseArray.set(magnitudeResponseArray);

            outPhaseResponseArray.set(null);
            outPhaseResponseArray.set(phaseResponseArray);

            responseArraysLength.set(frequencies.length);
        }
        else
        {
            outMagnitudeResponseArray.set(null);
            outPhaseResponseArray.set(null);
            responseArraysLength.set(0);
        }
    }
}

inFrequencyArray.onChange = () => updateFrequencyResponse();
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

        outAudio.set(null);
    }
    else
    {
        if (inAudio.get().connect) inAudio.get().connect(filterNode);
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
    updateFrequencyResponse();
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
    updateFrequencyResponse();
};

inDetune.onChange = () =>
{
    filterNode.detune.setValueAtTime(inDetune.get(), audioContext.currentTime);
    updateFrequencyResponse();
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
    updateFrequencyResponse();
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
    updateFrequencyResponse();
};
