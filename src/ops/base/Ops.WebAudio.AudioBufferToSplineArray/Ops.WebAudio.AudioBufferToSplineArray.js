// currently only uses mono, if we want to extract stereo data some changes in extractPeaks are needed

// constants
const SAMPLES_PER_PIXEL_MIN = 100; // might crash when this is too low

function findMinMax(array)
{
    let min = Infinity;
    let max = -Infinity;
    let i = 0;
    let len = array.length;
    let curr;

    for (; i < len; i++)
    {
        curr = array[i];
        if (min > curr)
        {
            min = curr;
        }
        if (max < curr)
        {
            max = curr;
        }
    }

    return {
        "min": min,
        "max": max
    };
}

const cgl = op.patch.cgl;

// input
const renderPort = op.inTrigger("Render");
const audioBufferPort = op.inObject("Audio Buffer", null, "audioBuffer");
const inWidth = op.inFloat("Width", 1);
const inHeight = op.inFloat("Height", 0.5);
const samplesPerPixelPort = op.inInt("Samples Per Pixel", 10000);

op.setPortGroup("Waveform Settings", [inWidth, inHeight, samplesPerPixelPort]);
// output
const nextPort = op.outTrigger("Next");
const outArray = op.outArray("Array Out");

// change listeners
let updating = true;
audioBufferPort.onChange = samplesPerPixelPort.onChange
= inWidth.onChange = inHeight.onChange = () =>
    {
        if (audioBufferPort.get())
        {
            if (!renderPort.isLinked())
            {
                const audioBuffer = audioBufferPort.get();
                if (!(audioBuffer instanceof AudioBuffer)) return;
            }
        }

        updating = true;
    };

renderPort.onTriggered = () =>
{
    if (updating)
    {
        extractPeaks();
        updating = false;
    }
    nextPort.trigger();
};

function extractPeaks()
{
    const audioBuffer = audioBufferPort.get();
    if (audioBuffer)
    {
        op.setUiError("noBuffer", null);

        if (!(audioBuffer instanceof AudioBuffer)) return;
    }
    else
    {
        op.setUiError("noBuffer", "You need to connect the \"Audio Buffer\" input for this op to work!", 0);
    }

    if (audioBuffer)
    {
        let samplesPerPixel = samplesPerPixelPort.get();
        if (samplesPerPixel < SAMPLES_PER_PIXEL_MIN)
        {
            op.setUiError("minSamples", "The value for \"Samples Per Pixel\" is lower than the minimum value " + SAMPLES_PER_PIXEL_MIN + ". Therefore the value has been set to " + SAMPLES_PER_PIXEL_MIN + ".", 1);
            samplesPerPixel = SAMPLES_PER_PIXEL_MIN;
        }
        else
        {
            op.setUiError("minSamples", null);
        }

        let makeMono = audioBuffer.numberOfChannels < 2; // TODO: If we make this a parameter, we have to check if the audio actually is stereo

        const peaks = webaudioPeaks(audioBuffer, samplesPerPixel, makeMono);

        // because we extract mono peaks we just access [0] here
        const typedArr = peaks.data[0];
        const regularArr = Array.prototype.slice.call(typedArr);
        const minMax = findMinMax(regularArr);
        const normalizedArray = [];
        for (let i = 0; i < regularArr.length; i += 1)
        {
            normalizedArray.push(
                CABLES.map(i, 0, regularArr.length - 1, -inWidth.get(), inWidth.get())
            );
            normalizedArray.push(
                CABLES.map(regularArr[i], minMax.min, minMax.max, -inHeight.get(), inHeight.get())
            );
            normalizedArray.push(0);
        }

        outArray.set(null);
        outArray.set(normalizedArray);
    }
    else
    {
        outArray.set(null);
    }
}
