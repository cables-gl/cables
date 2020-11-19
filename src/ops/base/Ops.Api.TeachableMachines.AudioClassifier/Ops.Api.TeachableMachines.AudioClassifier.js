const inExecute = op.inTrigger("Trigger In");
const initButton = op.inTriggerButton("Initialize");
const inUrl = op.inString("Model URL");

const outTrigger = op.outTrigger("Trigger");
const loadingFinished = op.outTrigger("Initialized");

initButton.onTriggered = init;
inUrl.onChange = init;

// output
const arrayOut = op.outArray("classifier");

async function createModel()
{
    const checkpointURL = inUrl.get() + "model.json"; // model topology
    const metadataURL = inUrl.get() + "metadata.json"; // model metadata

    const recognizer = speechCommands.create(
        "BROWSER_FFT", // fourier transform type, not useful to change
        undefined, // speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL);

    // check that model and metadata are loaded via HTTPS requests.
    await recognizer.ensureModelLoaded();
    return recognizer;
}

async function init()
{
    const baseUrl = inUrl.get();
    if (baseUrl)
    {
        op.uiAttr({ "error": null });
        const recognizer = await createModel();
        const classLabels = recognizer.wordLabels(); // get class labels

        // listen() takes two arguments:
        // 1. A callback function that is invoked anytime a word is recognized.
        // 2. A configuration object with adjustable fields
        recognizer.listen((result) =>
        {
            const arr = [];
            for (let i = 0; i < classLabels.length; i++)
            {
                const classPrediction = { "className": classLabels[i], "probability": result.scores[i] };

                arr.push(classPrediction);
            }
            arrayOut.set(arr);
            outTrigger.trigger();
        }, {
            "includeSpectrogram": true, // in case listen should return result.spectrogram
            "probabilityThreshold": 0.75,
            "invokeCallbackOnNoiseAndUnknown": true,
            "overlapFactor": 0.50 // probably want between 0.5 and 0.75. More info in README
        });
        loadingFinished.trigger();
    }
    else
    {
        op.uiAttr({ "error": "no baseurl set for the model, get one from teachablemachine" });
    }
}
