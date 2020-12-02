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
const SLOPES = [12, 24, 36, 48];
const inAudio = op.inObject("Audio In");

const inLowActive = op.inBool("Highpass active ", true);
const inLowSlope = op.inSwitch("Highpass Slope (in dB)", SLOPES, 12);
const inLowFrequency = op.inFloat("Low Frequency", 250);
const inLowQ = op.inFloat("Low Q", 0.0001);
op.setPortGroup("Highpass / Lowcut", [inLowActive, inLowSlope, inLowFrequency, inLowQ]);

const inHighActive = op.inBool("Lowpass active ", true);
const inHighSlope = op.inSwitch("Lowpass Slope (in dB)", SLOPES, 12);
const inHighFrequency = op.inFloat("High Frequency", 5000);
const inHighQ = op.inFloat("High Q", 0.0001);
op.setPortGroup("Lowpass / Highcut", [inHighActive, inHighSlope, inHighFrequency, inHighQ]);

const lowFilterNodes = SLOPES.map((entry) => audioContext.createBiquadFilter());
const highFilterNodes = SLOPES.map(() => audioContext.createBiquadFilter());

lowFilterNodes.forEach((node, index) =>
{
    if (index === 0) node.type = "highpass";
    else node.type = "peaking";

    const freq = inLowFrequency.get();
    node.frequency.setValueAtTime(clamp(freq, FREQUENCY_MIN, FREQUENCY_MAX), audioContext.currentTime);
    node.gain.setValueAtTime(clamp(0, GAIN_MIN, GAIN_MAX), audioContext.currentTime);
    node.Q.setValueAtTime(clamp(Number(inLowQ.get()), Q_MIN, Q_MAX), audioContext.currentTime);

    if (index < SLOPES.length - 1) node.connect(lowFilterNodes[index + 1]);
    else node.connect(highFilterNodes[0]);
});

highFilterNodes.forEach((node, index) =>
{
    if (index === 0) node.type = "lowpass";
    else node.type = "peaking";

    const freq = inHighFrequency.get();
    node.frequency.setValueAtTime(clamp(freq, FREQUENCY_MIN, FREQUENCY_MAX), audioContext.currentTime);
    node.gain.setValueAtTime(clamp(0, GAIN_MIN, GAIN_MAX), audioContext.currentTime);
    node.Q.setValueAtTime(clamp(Number(inHighQ.get()), Q_MIN, Q_MAX), audioContext.currentTime);
    if (index < SLOPES.length - 1) node.connect(highFilterNodes[index + 1]);
});

inHighFrequency.onChange = () =>
{
    for (let i = 0; i < SLOPES.length; i += 1)
    {
        const node = highFilterNodes[i];
        const freq = inHighFrequency.get();
        node.frequency.setValueAtTime(clamp(freq, FREQUENCY_MIN, FREQUENCY_MAX), audioContext.currentTime);
    }
};

inLowFrequency.onChange = () =>
{
    for (let i = 0; i < SLOPES.length; i += 1)
    {
        const node = lowFilterNodes[i];
        const freq = inLowFrequency.get();
        node.frequency.setValueAtTime(clamp(freq, FREQUENCY_MIN, FREQUENCY_MAX), audioContext.currentTime);
    }
};

inLowSlope.onChange = () =>
{
    const cascadeAmount = SLOPES.indexOf(Number(inLowSlope.get()));
    op.log(cascadeAmount);
    if (cascadeAmount < 0) return;

    for (let i = 0; i < SLOPES.length; i += 1)
    {
        const node = lowFilterNodes[i];
        if (i <= cascadeAmount) node.type = "highpass";
        else node.type = "peaking";
    }
    op.log(lowFilterNodes.map((node) => node.type));
};

inHighSlope.onChange = () =>
{
    const cascadeAmount = SLOPES.indexOf(Number(inHighSlope.get()));
    op.log(cascadeAmount);
    if (cascadeAmount < 0) return;

    for (let i = 0; i < SLOPES.length; i += 1)
    {
        const node = highFilterNodes[i];
        if (i <= cascadeAmount) node.type = "lowpass";
        else node.type = "peaking";
    }

    op.log(highFilterNodes.map((node) => node.type));
};

const outAudio = op.outObject("Audio Out");

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
                    oldAudioIn.disconnect(lowFilterNodes[0]);
                }
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
            inAudio.val.connect(lowFilterNodes[0]);
            op.setUiError("audioCtx", null);
        }
        else op.setUiError("audioCtx", "The passed input is not an audio context. Please make sure you connect an audio context to the input.", 2);
    }
    oldAudioIn = inAudio.get();
    outAudio.set(highFilterNodes[2]);
};

/*
const FILTER_SLOPES = [
    { node: lowFilterNode, port: inLowSlope },
    { node: highFilterNode, port: inHighSlope }
];

const FILTER_FREQUENCIES = [
    { node: lowFilterNode, port: inLowFrequency, name: "low" },
    { node: highFilterNode, port: inHighFrequency, name: "high" }
];

const FILTER_QS = [
    { node: lowFilterNode, port: inLowQ, name: "low" },
    { node: highFilterNode, port: inHighQ, name: "high" }
];

let lowCascadeAmount = 1;
let highCascadeAmount = 1;

FILTER_SLOPES.forEach((obj, index) => {
    obj.port.onChange = () => {
        const slope = Number(obj.port.get());
        const cascadeAmount = SLOPES.indexOf(slope) + 1;

        if (cascadeAmount < 1) return;

        // https://github.com/Tonejs/Tone.js/blob/dev/Tone/component/filter/Filter.ts

    }
});

FILTER_FREQUENCIES.forEach((obj, index) => {
    obj.port.onChange = () => {
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
    }
})

FILTER_QS.forEach((obj, index) => {
    obj.port.onChange = () => {
        const q = obj.port.get();
        obj.node.Q.setValueAtTime(clamp(q, Q_MIN, Q_MAX), audioContext.currentTime);

        if (q < Q_MIN) op.setUiError(obj.name + "_qRange", "Your Q value for the " + obj.name + " band is below the minimum possible value of " + Q_MIN + ".", 1);
        else if (q > Q_MAX) op.setUiError(obj.name + "_qRange", "Your Q value for the " + obj.name + " band is above the maximum possible value of " + Q_MAX + ".", 1);
        else
        {
            op.setUiError(obj.name + "_qRange", null);
        }
    }
});

*/
