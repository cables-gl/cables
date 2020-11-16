// Implemented by Mickey van Olst - Exploring Technology

"use strict";

const URL  = op.inString("URL");

const inExecute  = op.inTriggerButton("Trigger In");
const initButton   = op.inTriggerButton("Initialize");

const arrayOut = op.outArray("Array out");

//const outTrigger = op.outTrigger("Trigger out");
inExecute.onTriggered = loop;
initButton.onTriggered = init;

const webcamTex  = op.inObject("Webcam texture");

webcamTex.onChange=loop;

let model, webcam, labelContainer, maxPredictions;


const ele = document.createElement("canvas");
ele.id = "camImage";

let width = 200;
const height = 200;
let zoom = 1;

ele.style.position = "absolute";
ele.style["display"] = "none";
ele.style["z-index"] = 5;
ele.style.width = width + "px";
ele.style.height = height + "px";
ele.style["pointer-events"] = "none";
ele.style["transform-origin"] = "top left";
document.body.appendChild(ele);

var context = document.getElementById("camImage").getContext('2d');
console.log('context');
console.log(context);


// Load the image model and setup the webcam
async function init()
{
    const modelURL = URL.get() + "model.json";
    const metadataURL = URL.get() + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
}

async function loop()
{
    // draw camera texture onto canvas
    if(webcamTex.get() !== null) {
        if(webcamTex.get().videoElement !== undefined) {
            context.drawImage(webcamTex.get().videoElement, 0, 0, ele.width, ele.height);
            await predict();
        }
    }
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    if(ele !== undefined && model !== undefined) {
        const prediction = await model.predict(ele);
        arrayOut.set(prediction);
    }
}