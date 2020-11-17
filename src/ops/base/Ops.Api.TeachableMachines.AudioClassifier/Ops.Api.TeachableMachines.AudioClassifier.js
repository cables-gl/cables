// Implemented by Mickey van Olst - Exploring Technology

"use strict";

// input
const initButton   = op.inTriggerButton("initialize");
const URL  = op.inString("URL");

initButton.onTriggered = init;
URL.onChange = init;

// output
const arrayOut = op.outArray("classifier");


async function createModel() {
    const checkpointURL = URL.get() + "model.json"; // model topology
    const metadataURL = URL.get() + "metadata.json"; // model metadata

    const recognizer = speechCommands.create(
        "BROWSER_FFT", // fourier transform type, not useful to change
        undefined, // speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL);

    // check that model and metadata are loaded via HTTPS requests.
    await recognizer.ensureModelLoaded();

    return recognizer;
}

async function init() {
    const recognizer = await createModel();
    const classLabels = recognizer.wordLabels(); // get class labels

    // listen() takes two arguments:
    // 1. A callback function that is invoked anytime a word is recognized.
    // 2. A configuration object with adjustable fields
    recognizer.listen(result => {
        const scores = result.scores; // probability of prediction for each class
        // render the probability scores per class
        let arr = [];
        for (let i = 0; i < classLabels.length; i++) {
            const classPrediction = { className : classLabels[i] , probability : result.scores[i] };

            arr.push(classPrediction);
        //    labelContainer.childNodes[i].innerHTML = classPrediction;
        }
        arrayOut.set(arr);

    }, {
        includeSpectrogram: true, // in case listen should return result.spectrogram
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50 // probably want between 0.5 and 0.75. More info in README
    });

    // Stop the recognition in 5 seconds.
    // setTimeout(() => recognizer.stopListening(), 5000);
}