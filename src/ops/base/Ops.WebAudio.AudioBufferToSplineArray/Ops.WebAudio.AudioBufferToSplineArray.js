// currently only uses mono, if we want to extract stereo data some changes in extractPeaks are needed

// constants
const SAMPLES_PER_PIXEL_MIN = 100; // might crash when this is too low

function findMinMax(array) {
    var min = Infinity;
    var max = -Infinity;
    var i = 0;
    var len = array.length;
    var curr;

    for(; i < len; i++) {
        curr = array[i];
        if (min > curr) {
            min = curr;
        }
        if (max < curr) {
            max = curr;
        }
    }

    return {
        min: min,
        max: max
    };
}

const cgl = op.patch.cgl;

// input
const renderPort = op.inTrigger("Render");
const audioBufferPort = op.inObject("Audio Buffer");
const widthPort = op.inFloat("Width", 1);
const inHeight = op.inFloat("Height", 1);
const samplesPerPixelPort = op.inValue("Samples Per Pixel", 100000);

op.setPortGroup("Waveform Settings", [widthPort, inHeight, samplesPerPixelPort]);
// output
const nextPort = op.outTrigger("Next");
const outArray = op.outArray("Array Out");

// change listeners
let updating = true;
audioBufferPort.onChange = samplesPerPixelPort.onChange
= widthPort.onChange = inHeight.onChange = () => {
    updating = true;
}

renderPort.onTriggered = () => {
    if (updating) {
        extractPeaks();
        updating = false;
    }
    nextPort.trigger();
}

function extractPeaks()
{
    const audioBuffer = audioBufferPort.get();
    if (audioBuffer)
    {
        op.setUiError("noBuffer", null);

        if (!(audioBuffer instanceof AudioBuffer))
        {
            op.setUiError("wrongBufferType", "The passed object is not of type AudioBuffer. You have to pass an AudioBuffer to visualize the waveform.", 2);
            return;
        }
        else
        {
            op.setUiError("wrongBufferType", null);
        }
    }
    else
    {
        op.setUiError("noBuffer", "You need to connect the \"Audio Buffer\" input for this op to work!", 0);
        op.setUiError("wrongBufferType", null);
    }

    if (audioBuffer)
    {
        op.log("bratan");
        let samplesPerPixel = samplesPerPixelPort.get();
        if (samplesPerPixel < SAMPLES_PER_PIXEL_MIN)
        {
            op.setUiError("minSamples", "The value for \"Samples Per Pixel\" is lower than the minimum value " + SAMPLES_PER_PIXEL_MIN + ". Therefore the value has been set to " + SAMPLES_PER_PIXEL_MIN + ".", 1);
            samplesPerPixel = SAMPLES_PER_PIXEL_MIN;
        } else {
            op.setUiError("minSamples", null);
        }

        let makeMono = audioBuffer.numberOfChannels < 2; // TODO: If we make this a parameter, we have to check if the audio actually is stereo

        const peaks = webaudioPeaks(audioBuffer, samplesPerPixel, makeMono);

        // because we extract mono peaks we just access [0] here
        const typedArr = peaks.data[0];

        const normalizedArray = [];

        for (let i = 0; i < typedArr.length; i += 1) {
                normalizedArray.push(i);
                normalizedArray.push(typedArr[i]);
                normalizedArray.push(0);
        }

        const minMax = findMinMax(normalizedArray);
        for (let i = 0; i < normalizedArray.length; i += 3) {
            // * TODO: width & heihgt only work properly with 100k samples per pixel... wtf
            normalizedArray[i + 0] = CABLES.map(normalizedArray[i + 0], minMax.min, minMax.max, 0, widthPort.get()); // * widthPort.get();
            normalizedArray[i + 1] = CABLES.map(normalizedArray[i + 1], minMax.min, minMax.max, -1 * inHeight.get(), inHeight.get());
        }

        outArray.set(null);
        outArray.set(normalizedArray);
    }
    else
    {
        outArray.set(null);
    }
}
