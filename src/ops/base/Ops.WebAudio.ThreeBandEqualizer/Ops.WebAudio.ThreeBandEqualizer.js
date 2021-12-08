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

const inAudio = op.inObject("Audio In", null, "audioNode");

const inLowFilterType = op.inDropDown("Low Filter Type", ["peaking", "lowshelf"], "lowshelf");
const inLowFrequency = op.inFloat("Low Frequency", 250);
const inLowQ = op.inFloat("Low Q", 0.0001);
const inLowGain = op.inFloat("Low Gain", 0);
op.setPortGroup("Low", [inLowFilterType, inLowFrequency, inLowQ, inLowGain]);

const inMidFilterType = op.inDropDown("Mid Filter Type", ["peaking", "notch"], "peaking");
const inMidFrequency = op.inFloat("Mid Frequency", 1000);
const inMidQ = op.inFloat("Mid Q", 0.0001);
const inMidGain = op.inFloat("Mid Gain", 0);
op.setPortGroup("Mid", [inMidFilterType, inMidFrequency, inMidQ, inMidGain]);

const inHighFilterType = op.inDropDown("High Filter Type", ["peaking", "highshelf"], "highshelf");
const inHighFrequency = op.inFloat("High Frequency", 5000);
const inHighQ = op.inFloat("High Q", 0.0001);
const inHighGain = op.inFloat("High Gain", 0);
op.setPortGroup("High", [inHighFilterType, inHighFrequency, inHighQ, inHighGain]);

const lowFilterNode = audioContext.createBiquadFilter();
const midFilterNode = audioContext.createBiquadFilter();
const highFilterNode = audioContext.createBiquadFilter();
lowFilterNode.connect(midFilterNode);
midFilterNode.connect(highFilterNode);

lowFilterNode.type = inLowFilterType.get();
midFilterNode.type = inMidFilterType.get();
highFilterNode.type = inHighFilterType.get();
const FILTER_TYPES = [
    { "node": lowFilterNode, "port": inLowFilterType },
    { "node": midFilterNode, "port": inMidFilterType },
    { "node": highFilterNode, "port": inHighFilterType }
];

const FILTER_FREQUENCIES = [
    { "node": lowFilterNode, "port": inLowFrequency, "name": "low" },
    { "node": midFilterNode, "port": inMidFrequency, "name": "mid" },
    { "node": highFilterNode, "port": inHighFrequency, "name": "high" }
];

const FILTER_QS = [
    { "node": lowFilterNode, "port": inLowQ, "name": "low" },
    { "node": midFilterNode, "port": inMidQ, "name": "mid" },
    { "node": highFilterNode, "port": inHighQ, "name": "high" }
];

const FILTER_GAINS = [
    { "node": lowFilterNode, "port": inLowGain, "name": "low" },
    { "node": midFilterNode, "port": inMidGain, "name": "mid" },
    { "node": highFilterNode, "port": inHighGain, "name": "high" }
];

FILTER_TYPES.forEach((obj, index) =>
{
    /* initial greyout-ing */
    const type = obj.port.get();

    FILTER_GAINS[index].port.setUiAttribs({
        "greyout": ["lowpass", "highpass", "bandpass", "notch", "allpass"].includes(type)
    });

    FILTER_QS[index].port.setUiAttribs({
        "greyout": ["lowshelf", "highshelf"].includes(type)
    });

    /* onChange handler */
    obj.port.onChange = () =>
    {
        const type = obj.port.get();
        FILTER_GAINS[index].port.setUiAttribs({
            "greyout": ["lowpass", "highpass", "bandpass", "notch", "allpass"].includes(type)
        });

        FILTER_QS[index].port.setUiAttribs({
            "greyout": ["lowshelf", "highshelf"].includes(type)
        });

        obj.node.type = type;
    };
});

FILTER_FREQUENCIES.forEach((obj, index) =>
{
    obj.port.onChange = () =>
    {
        const freq = obj.port.get();
        if (freq)
        {
            if (freq >= FREQUENCY_MIN && freq <= FREQUENCY_MAX)
            {
                obj.node.frequency.setValueAtTime(clamp(freq, FREQUENCY_MIN, FREQUENCY_MAX), audioContext.currentTime);
                op.setUiError("freqRange", null);
            }
            if (freq < FREQUENCY_MIN)
            {
                op.setUiError("freqRange", "The frequency you selected for the " + obj.name + " band is lower than the possible frequency of " + FREQUENCY_MIN + " Hz.", 1);
            }
            else if (freq > FREQUENCY_MAX)
            {
                op.setUiError("freqRange", "The frequency you selected for the " + obj.name + " band is higher than the possible frequency of " + FREQUENCY_MAX + " Hz.", 1);
            }
        }
    };
});

FILTER_QS.forEach((obj, index) =>
{
    obj.port.onChange = () =>
    {
        const q = obj.port.get();
        obj.node.Q.setValueAtTime(clamp(q, Q_MIN, Q_MAX), audioContext.currentTime);

        if (q < Q_MIN) op.setUiError(obj.name + "_qRange", "Your Q value for the " + obj.name + " band is below the minimum possible value of " + Q_MIN + ".", 1);
        else if (q > Q_MAX) op.setUiError(obj.name + "_qRange", "Your Q value for the " + obj.name + " band is above the maximum possible value of " + Q_MAX + ".", 1);
        else
        {
            op.setUiError(obj.name + "_qRange", null);
        }
    };
});

FILTER_GAINS.forEach((obj, index) =>
{
    obj.port.onChange = () =>
    {
        const gain = obj.port.get();

        obj.node.gain.setValueAtTime(clamp(gain, GAIN_MIN, GAIN_MAX), audioContext.currentTime);

        if (gain < GAIN_MIN) op.setUiError(obj.name + "GainRange", "Your gain value for the " + obj.name + " band is below the minimum possible value of " + GAIN_MIN + " dB.", 1);
        else if (gain > GAIN_MAX) op.setUiError(obj.name + "GainRange", "Your gain value for the " + obj.name + " band is above the maximum possible value of " + GAIN_MAX + " dB.", 1);
        else
        {
            op.setUiError(obj.name + "GainRange", null);
        }
    };
});

const outAudio = op.outObject("Audio Out", null, "audioNode");

let oldAudioIn = null;

inAudio.onChange = function ()
{
    if (!inAudio.get())
    {
        if (oldAudioIn)
        {
            try
            {
                if (oldAudioIn.disconnect)
                {
                    oldAudioIn.disconnect(lowFilterNode);
                }
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
        if (inAudio.get().connect) inAudio.get().connect(lowFilterNode);
    }
    oldAudioIn = inAudio.get();
    outAudio.set(highFilterNode);
};

op.onDelete = () =>
{
    lowFilterNode.disconnect();
    midFilterNode.disconnect();
};
