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
const inAudio = op.inObject("Audio In", null, "audioNode");

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

const lowFilterNodes = SLOPES.map(entry => audioContext.createBiquadFilter());
const highFilterNodes = SLOPES.map(() => audioContext.createBiquadFilter());

/* instantiation */
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

/* onChange handlers */

let lastHighState = highFilterNodes.map(node => node.type);

inHighActive.onChange = () =>
{
    inHighSlope.setUiAttribs({ "greyout": !inHighActive.get() });
    inHighFrequency.setUiAttribs({ "greyout": !inHighActive.get() });
    inHighQ.setUiAttribs({ "greyout": !inHighActive.get() });

    if (inHighActive.get())
    {
        for (let i = 0; i < SLOPES.length; i += 1)
        {
            const node = highFilterNodes[i];
            node.type = lastHighState[i];
        }
    }
    else
    {
        lastHighState = highFilterNodes.map(node => node.type);

        for (let i = 0; i < SLOPES.length; i += 1)
        {
            const node = highFilterNodes[i];
            node.type = "peaking";
        }
    }
};

let lastLowState = lowFilterNodes.map(node => node.type);

inLowActive.onChange = () =>
{
    inLowSlope.setUiAttribs({ "greyout": !inLowActive.get() });
    inLowFrequency.setUiAttribs({ "greyout": !inLowActive.get() });
    inLowQ.setUiAttribs({ "greyout": !inLowActive.get() });

    if (inLowActive.get())
    {
        for (let i = 0; i < SLOPES.length; i += 1)
        {
            const node = lowFilterNodes[i];
            node.type = lastLowState[i];
        }
    }
    else
    {
        lastLowState = lowFilterNodes.map(node => node.type);

        for (let i = 0; i < SLOPES.length; i += 1)
        {
            const node = lowFilterNodes[i];
            node.type = "peaking";
        }
    }
};

inHighFrequency.onChange = () =>
{
    if (inHighActive.get())
    {
        const freq = inHighFrequency.get();

        if (freq >= FREQUENCY_MIN && freq <= FREQUENCY_MAX) op.setUiError("freqRangeHigh", null);

        if (freq < FREQUENCY_MIN)
        {
            op.setUiError("freqRangeHigh", "The frequency you selected for the lowpass filter is lower than the possible frequency of " + FREQUENCY_MIN + " Hz.", 1);
        }
        else if (freq > FREQUENCY_MAX)
        {
            op.setUiError("freqRangeHigh", "The frequency you selected for the lowpass filter is higher than the possible frequency of " + FREQUENCY_MAX + " Hz.", 1);
        }

        for (let i = 0; i < SLOPES.length; i += 1)
        {
            const node = highFilterNodes[i];
            node.frequency.setValueAtTime(clamp(freq, FREQUENCY_MIN, FREQUENCY_MAX), audioContext.currentTime);
        }
    }
};

inLowFrequency.onChange = () =>
{
    if (inLowActive.get())
    {
        const freq = inLowFrequency.get();

        if (freq >= FREQUENCY_MIN && freq <= FREQUENCY_MAX) op.setUiError("freqRangeLow", null);

        if (freq < FREQUENCY_MIN)
        {
            op.setUiError("freqRangeLow", "The frequency you selected for the highpass filter is lower than the possible frequency of " + FREQUENCY_MIN + " Hz.", 1);
        }
        else if (freq > FREQUENCY_MAX)
        {
            op.setUiError("freqRangeLow", "The frequency you selected for the highpass filter is higher than the possible frequency of " + FREQUENCY_MAX + " Hz.", 1);
        }

        for (let i = 0; i < SLOPES.length; i += 1)
        {
            const node = lowFilterNodes[i];
            node.frequency.setValueAtTime(clamp(freq, FREQUENCY_MIN, FREQUENCY_MAX), audioContext.currentTime);
        }
    }
};

inHighSlope.onChange = () =>
{
    if (inHighActive.get())
    {
        const cascadeAmount = SLOPES.indexOf(Number(inHighSlope.get()));
        if (cascadeAmount < 0) return;

        for (let i = 0; i < SLOPES.length; i += 1)
        {
            const node = highFilterNodes[i];
            if (i <= cascadeAmount) node.type = "lowpass";
            else node.type = "peaking";
        }
    }
};

inLowSlope.onChange = () =>
{
    if (inLowActive.get())
    {
        const cascadeAmount = SLOPES.indexOf(Number(inLowSlope.get()));

        if (cascadeAmount < 0) return;

        for (let i = 0; i < SLOPES.length; i += 1)
        {
            const node = lowFilterNodes[i];
            if (i <= cascadeAmount) node.type = "highpass";
            else node.type = "peaking";
        }
    }
};

inHighQ.onChange = () =>
{
    if (inHighActive.get())
    {
        const q = inHighQ.get();

        if (q < Q_MIN) op.setUiError("qRangeHigh", "Your Q value for the lowpass filter is below the minimum possible value of " + Q_MIN + ".", 1);
        else if (q > Q_MAX) op.setUiError("qRangeHigh", "Your Q value for lowpass filter is above the maximum possible value of " + Q_MAX + ".", 1);
        else op.setUiError("qRangeHigh", null);

        for (let i = 0; i < SLOPES.length; i += 1)
        {
            const node = highFilterNodes[i];
            node.Q.setValueAtTime(clamp(q, Q_MIN, Q_MAX), audioContext.currentTime);
        }
    }
};

inLowQ.onChange = () =>
{
    if (inLowActive.get())
    {
        const q = inLowQ.get();

        if (q < Q_MIN) op.setUiError("qRangeLow", "Your Q value for the highpass filter is below the minimum possible value of " + Q_MIN + ".", 1);
        else if (q > Q_MAX) op.setUiError("qRangeLow", "Your Q value for highpass filter is above the maximum possible value of " + Q_MAX + ".", 1);
        else op.setUiError("qRangeLow", null);

        for (let i = 0; i < SLOPES.length; i += 1)
        {
            const node = lowFilterNodes[i];
            node.Q.setValueAtTime(clamp(q, Q_MIN, Q_MAX), audioContext.currentTime);
        }
    }
};

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
                    oldAudioIn.disconnect(lowFilterNodes[0]);
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
        if (inAudio.get().connect) inAudio.get().connect(lowFilterNodes[0]);
    }

    oldAudioIn = inAudio.get();
    outAudio.set(highFilterNodes[SLOPES.length - 1]);
};

op.onDelete = () =>
{
    lowFilterNodes.forEach((node, index) =>
    {
        node.disconnect();
    });

    highFilterNodes.forEach((node, index) =>
    {
        if (index < SLOPES.length - 1) node.disconnect();
    });
};
