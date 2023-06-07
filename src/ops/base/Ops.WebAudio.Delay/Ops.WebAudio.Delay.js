function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}

const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
const NOTE_NAMES = [];
const MAX_DELAY_TIME = 179.999;

for (let i = 0; i < 7 * 3; i += 1)
{
    const noteValue = 2 ** (i % 7);
    let string = "1/" + noteValue;
    if (i > 6 && i < 14)
    {
        string = "1/" + noteValue + " Triplet";
    }
    else if (i > 13)
    {
        string = "1/" + noteValue + " Dotted";
    }
    NOTE_NAMES.push(string + " Note");
}

const audioIn = op.inObject("Audio In", null, "audioNode");
const inDryWet = op.inFloatSlider("Dry/Wet", 0.4);
const inFeedback = op.inFloatSlider("Feedback", 0.4);
const inDelayMS = op.inFloat("Delay Time (MS)", 100);
const inDelayShift = op.inFloat("Delay Shift (MS)", 0);
const inBpmSync = op.inBool("BPM based delay time", false);
const inBPM = op.inFloat("BPM", 120);
const inDelayNotes = op.inDropDown("Delay Time (note value) ", NOTE_NAMES, "1/8 Dotted Note");
const inUseModulation = op.inBool("Use Filter & Modulation", false);
const inHighpassFrequency = op.inFloat("Highpass Frequency", 300);
const inHighpassQ = op.inFloat("Highpass Q", 2);
const inLowpassFrequency = op.inFloat("Lowpass Frequency", 9000);
const inLowpassQ = op.inFloat("Lowpass Q", 2);
const inLfoSpeed = op.inFloat("LFO Speed (Hz) ", 3.14);
const inLfoIntensity = op.inFloatSlider("LFO Intensity", 0.4);
const inLfoWave = op.inDropDown("LFO Waveform", ["sine", "triangle"], "sine");
inLowpassFrequency.setUiAttribs({ "greyout": !inUseModulation.get() });
inLowpassQ.setUiAttribs({ "greyout": !inUseModulation.get() });
inHighpassFrequency.setUiAttribs({ "greyout": !inUseModulation.get() });
inHighpassQ.setUiAttribs({ "greyout": !inUseModulation.get() });
inLfoSpeed.setUiAttribs({ "greyout": !inUseModulation.get() });
inLfoIntensity.setUiAttribs({ "greyout": !inUseModulation.get() });
inLfoWave.setUiAttribs({ "greyout": !inUseModulation.get() });
op.setPortGroup("Filters & Modulation", [inLowpassFrequency, inLowpassQ, inHighpassFrequency, inHighpassQ, inLfoSpeed, inLfoIntensity, inLfoWave]);

const audioOut = op.outObject("Mix Out", null, "audioNode");
const delayOut = op.outObject("Wet Out", null, "audioNode");

const MULTIPLIERS = [
    4, 2, 1, 1 / 2, 1 / 4, 1 / 8, 1 / 16,
    8 / 3, 4 / 3, 2 / 3, 1 / 3, 1 / 6, 1 / 12, 1 / 24,
    6, 3, 3 / 2, 3 / 4, 3 / 8, 3 / 16, 3 / 32 // dotted
];

const MIN_BPM = 20;
let QUARTER_NOTE_S = 60 / Math.max(20, inBPM.get());
let NOTES_IN_S = MULTIPLIERS.map((multiplier) => { return multiplier * QUARTER_NOTE_S; });

const calculateDelayTime = () =>
{
    if (inBpmSync.get())
    {
        const timeIndex = NOTE_NAMES.indexOf(inDelayNotes.get());

        const timeValue = NOTES_IN_S[timeIndex] + (parseFloat(inDelayShift.get()) / 1000);
        clamp(timeValue, 0, MAX_DELAY_TIME);
        return timeValue;
    }

    const unsyncedTime = (parseFloat(inDelayMS.get()) + parseFloat(inDelayShift.get())) / 1000.0;

    if (unsyncedTime < 0) op.setUiError("minDelayTime", "The delay time is lower than 0 ms. Setting to 0.", 1);
    else op.setUiError("minDelayTime", null);

    return Math.max(0, unsyncedTime);
};

op.setPortGroup("Main Controls", [inDryWet, inFeedback, inDelayMS, inDelayShift]);
op.setPortGroup("Synced Controls", [inBPM, inDelayNotes]);

inBPM.setUiAttribs({ "greyout": !inBpmSync.get() });
inDelayNotes.setUiAttribs({ "greyout": !inBpmSync.get() });
inDelayMS.setUiAttribs({ "greyout": inBpmSync.get() });

inBpmSync.onChange = () =>
{
    inBPM.setUiAttribs({ "greyout": !inBpmSync.get() });
    inDelayNotes.setUiAttribs({ "greyout": !inBpmSync.get() });
    inDelayMS.setUiAttribs({ "greyout": inBpmSync.get() });

    delayNode.delayTime.linearRampToValueAtTime(calculateDelayTime(), audioCtx.currentTime + 0.2);

    if (inBPM.get() < MIN_BPM) op.setUiError("minBPM", "The minimum BPM value is " + MIN_BPM + " BPM.", 1);
    else op.setUiError("minBPM", null);
};

const inputNode = audioCtx.createGain(); // we create an input node so we can change the delay without requiring the input signal
const delayNode = audioCtx.createDelay(MAX_DELAY_TIME);
const dryNode = audioCtx.createGain();
const wetNode = audioCtx.createGain();

const feedbackNode = audioCtx.createGain();
const outputNode = audioCtx.createGain();

const filterHighpassNode = audioCtx.createBiquadFilter();
const filterLowpassNode = audioCtx.createBiquadFilter();
filterLowpassNode.type = "lowpass";
filterLowpassNode.frequency.value = inLowpassFrequency.get();
filterLowpassNode.Q.value = inLowpassQ.get();

filterHighpassNode.connect(filterLowpassNode);
filterHighpassNode.type = "highpass";
filterHighpassNode.frequency.value = inHighpassFrequency.get();
filterHighpassNode.Q.value = inHighpassQ.get();

const lfoNode = audioCtx.createOscillator();
lfoNode.frequency.value = inLfoSpeed.get(); // Freq. in Hz
const lfoGainNode = audioCtx.createGain();
lfoGainNode.gain.value = inLfoIntensity.get() / 800;
lfoNode.connect(lfoGainNode);
lfoNode.start();

delayNode.delayTime.value = calculateDelayTime();
feedbackNode.gain.value = parseFloat(inFeedback.get());
wetNode.gain.value = parseFloat(inDryWet.get());
dryNode.gain.value = 1.0 - parseFloat(inDryWet.get());

delayNode.connect(feedbackNode);
feedbackNode.connect(delayNode);

inputNode.connect(dryNode);
inputNode.connect(delayNode);

dryNode.connect(outputNode);
delayNode.connect(wetNode);

wetNode.connect(outputNode);

inUseModulation.onChange = () =>
{
    inLowpassFrequency.setUiAttribs({ "greyout": !inUseModulation.get() });
    inLowpassQ.setUiAttribs({ "greyout": !inUseModulation.get() });
    inHighpassFrequency.setUiAttribs({ "greyout": !inUseModulation.get() });
    inHighpassQ.setUiAttribs({ "greyout": !inUseModulation.get() });
    inLfoSpeed.setUiAttribs({ "greyout": !inUseModulation.get() });
    inLfoIntensity.setUiAttribs({ "greyout": !inUseModulation.get() });
    inLfoWave.setUiAttribs({ "greyout": !inUseModulation.get() });

    if (inUseModulation.get())
    {
        lfoGainNode.connect(delayNode.delayTime);

        inputNode.disconnect(delayNode);

        inputNode.connect(filterHighpassNode);
        filterLowpassNode.connect(delayNode);
    }
    else
    {
        try
        {
            // not possible to check isConnected, but if it isn't this will throw
            lfoGainNode.disconnect(delayNode.delayTime);

            inputNode.disconnect(filterHighpassNode);
            filterLowpassNode.disconnect(delayNode);
        }
        catch (e)
        {
            op.log("failed to disconnect audionodes", e);
        }

        inputNode.connect(delayNode);
    }
};

inLfoIntensity.onChange = () =>
{
    lfoGainNode.gain.linearRampToValueAtTime(inLfoIntensity.get() / 800, audioCtx.currentTime + 0.1);
};

inLfoSpeed.onChange = () =>
{
    lfoNode.frequency.linearRampToValueAtTime(inLfoSpeed.get(), audioCtx.currentTime + 0.1);
};

inLfoWave.onChange = () =>
{
    lfoNode.type = inLfoWave.get();
};
inDelayMS.onChange = inDelayShift.onChange = inDelayNotes.onChange = () =>
{
    if (inBPM.get() < MIN_BPM) op.setUiError("minBPM", "The minimum BPM value is " + MIN_BPM + " BPM.", 1);
    else op.setUiError("minBPM", null);

    delayNode.delayTime.linearRampToValueAtTime(calculateDelayTime(), audioCtx.currentTime + 0.2);
};

inBPM.onChange = () =>
{
    QUARTER_NOTE_S = 60 / Math.max(MIN_BPM, inBPM.get());
    NOTES_IN_S = MULTIPLIERS.map((multiplier) => { return multiplier * QUARTER_NOTE_S; });

    delayNode.delayTime.linearRampToValueAtTime(calculateDelayTime(), audioCtx.currentTime + 0.1);

    if (inBPM.get() < MIN_BPM) op.setUiError("minBPM", "The minimum BPM value is " + MIN_BPM + " BPM.", 1);
    else op.setUiError("minBPM", null);
};

inDryWet.onChange = () =>
{
    wetNode.gain.linearRampToValueAtTime(Number(inDryWet.get()), audioCtx.currentTime + 0.01);
    dryNode.gain.linearRampToValueAtTime((1 - Number(inDryWet.get())), audioCtx.currentTime + 0.01);
};

inFeedback.onChange = () =>
{
    feedbackNode.gain.linearRampToValueAtTime(Number(inFeedback.get()), audioCtx.currentTime + 0.01);
};

const FREQUENCY_MIN = 10;
const FREQUENCY_MAX = audioCtx.sampleRate / 2; // Nyquist frequency.
const Q_MIN = 0.0001;
const Q_MAX = 1000;

inHighpassFrequency.onChange = () =>
{
    const freq = inHighpassFrequency.get();
    if (freq)
    {
        if (freq >= FREQUENCY_MIN && freq <= FREQUENCY_MAX)
        {
            filterHighpassNode.frequency.linearRampToValueAtTime(clamp(freq, FREQUENCY_MIN, FREQUENCY_MAX), audioContext.currentTime, +0.01);
            op.setUiError("freqRangeHighpass", null);
        }
        if (freq < FREQUENCY_MIN)
        {
            op.setUiError("freqRangeHighpass", "The highpass frequency you selected is lower than the possible frequency of " + FREQUENCY_MIN + " Hz.", 1);
        }
        else if (freq > FREQUENCY_MAX)
        {
            op.setUiError("freqRangeHighpass", "The highpass frequency you selected is higher than the possible frequency of " + FREQUENCY_MAX + " Hz.", 1);
        }
    }
};

inHighpassQ.onChange = () =>
{
    const q = inHighpassQ.get();
    filterHighpassNode.Q.linearRampToValueAtTime(clamp(q, Q_MIN, Q_MAX), audioContext.currentTime + 0.01);

    if (q < Q_MIN) op.setUiError("qRangeHighpass", "Your highpass Q value is below the minimum possible value of " + Q_MIN + ".", 1);
    else if (q > Q_MAX) op.setUiError("qRangeHighpass", "Your highpass Q value is above the maximum possible value of " + Q_MAX + ".", 1);
    else
    {
        op.setUiError("qRangeHighpass", null);
    }
};

inLowpassFrequency.onChange = () =>
{
    const freq = inLowpassFrequency.get();
    if (freq)
    {
        if (freq >= FREQUENCY_MIN && freq <= FREQUENCY_MAX)
        {
            filterLowpassNode.frequency.linearRampToValueAtTime(clamp(freq, FREQUENCY_MIN, FREQUENCY_MAX), audioContext.currentTime, +0.01);
            op.setUiError("freqRangeLowpass", null);
        }
        if (freq < FREQUENCY_MIN)
        {
            op.setUiError("freqRangeLowpass", "The lowpass frequency you selected is lower than the possible frequency of " + FREQUENCY_MIN + " Hz.", 1);
        }
        else if (freq > FREQUENCY_MAX)
        {
            op.setUiError("freqRangeLowpass", "The lowpass frequency you selected is higher than the possible frequency of " + FREQUENCY_MAX + " Hz.", 1);
        }
    }
};

inLowpassQ.onChange = () =>
{
    const q = inLowpassQ.get();
    filterLowpassNode.Q.linearRampToValueAtTime(clamp(q, Q_MIN, Q_MAX), audioContext.currentTime + 0.01);

    if (q < Q_MIN) op.setUiError("qRangeLowpass", "Your lowpass Q value is below the minimum possible value of " + Q_MIN + ".", 1);
    else if (q > Q_MAX) op.setUiError("qRangeLowpass", "Your lowpass Q value is above the maximum possible value of " + Q_MAX + ".", 1);
    else
    {
        op.setUiError("qRangeLowpass", null);
    }
};

let oldAudioIn = null;
audioIn.onChange = function ()
{
    if (!audioIn.get())
    {
        if (oldAudioIn)
        {
            try
            {
                if (oldAudioIn.disconnect)
                {
                    oldAudioIn.disconnect(inputNode);
                }
            }
            catch (e)
            {
                op.log(e);
            }
        }
        audioOut.set(null);
    }
    else
    {
        if (audioIn.get().connect) audioIn.get().connect(inputNode);
    }

    oldAudioIn = audioIn.get();
    audioOut.set(outputNode);
    delayOut.set(delayNode);
};

op.onDelete = () =>
{
    try
    {
        // not possible to check isConnected, but if it isn't this will throw
        lfoNode.disconnect();
        delayNode.disconnect();
        feedbackNode.disconnect();

        inputNode.disconnect();

        dryNode.disconnect();
        delayNode.disconnect();

        wetNode.disconnect();
        filterHighpassNode.disconnect();

        if (inUseModulation.get())
        {
            lfoGainNode.disconnect();
            filterLowpassNode.disconnect();
        }
    }
    catch (e)
    {
        op.log("failed to disconnect audionodes", e);
    }
};
