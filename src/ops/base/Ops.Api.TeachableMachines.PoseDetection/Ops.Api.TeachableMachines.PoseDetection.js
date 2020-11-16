// Implemented by Mickey van Olst - Exploring Technology

"use strict";

// input
const inExecute  = op.inTriggerButton("render");
const initButton   = op.inTriggerButton("initialize");
const URL  = op.inString("URL");
const webcamTex  = op.inObject("webcam texture");
const flipImage = op.inBool("flip image");
let hasFlipped = false;
flipImage.onChange = checkFlip;
inExecute.onTriggered = loop;
initButton.onTriggered = init;
URL.onChange = init;
webcamTex.onChange=loop;

// output
const outTrigger = op.outTrigger("trigger");
const arrayOut = op.outArray("classifier");
const poseArrayOut = op.outArray("Pose positions");
const flipImageOut = op.outBool("image flipped");


let model, webcam, labelContainer, maxPredictions;

// canvas buffers
let width = 200;
let height = 200;
let zoom = 1;

const camCanvas = document.createElement("canvas");
camCanvas.id = "camImage";

camCanvas.style.position = "absolute";
camCanvas.style["display"] = "none";
camCanvas.style["z-index"] = 5;
camCanvas.style.width = width + "px";
camCanvas.style.height = height + "px";
camCanvas.style["pointer-events"] = "none";
camCanvas.style["transform-origin"] = "top right";
camCanvas.style["left"] = "80px";
camCanvas.style["top"] = "230px";
document.body.appendChild(camCanvas);

var camCtx = document.getElementById("camImage").getContext('2d');

const poseCanvas = document.createElement("canvas");
poseCanvas.id = "poseImage";

poseCanvas.style.position = "absolute";
poseCanvas.style["display"] = "none";
poseCanvas.style["z-index"] = 5;
poseCanvas.style.width = width + "px";
poseCanvas.style.height = height + "px";
poseCanvas.style["pointer-events"] = "none";
poseCanvas.style["transform-origin"] = "top right";
poseCanvas.style["left"] = "80px";
poseCanvas.style["top"] = "30px";
document.body.appendChild(poseCanvas);

var poseCtx = document.getElementById("poseImage").getContext('2d');

// texture output
//const cgl = op.patch.cgl;
//const outTexture = op.outTexture("texture");
//const canvasTexture = new CGL.Texture(cgl);

function checkFlip() {
    hasFlipped = false;
    flipImageOut.set(flipImage.get());
}

// Load the image model and setup the webcam
async function init()
{
    const modelURL = URL.get() + "model.json";
    const metadataURL = URL.get() + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();


}

async function loop()
{
    // draw camera texture onto canvas
    if(webcamTex.get() !== null) {
        //if(webcamTex.get().videoElement !== undefined) {
            //console.log(webcamTex.get().tex);
            if(hasFlipped == false) {
                camCtx.translate(camCanvas.width, 0);
                camCtx.scale(-1, 1);
                hasFlipped = true;
            }
            camCtx.drawImage(webcamTex.get().videoElement, 0, 0, camCanvas.width, camCanvas.height);

            await predict();
        //}
    }
    outTrigger.trigger();
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    if(camCanvas !== undefined && model !== undefined) {
        // Prediction #1: run input through posenet
        // estimatePose can take in an image, video or canvas html element
        const { pose, posenetOutput } = await model.estimatePose(camCanvas);
        // Prediction 2: run input through teachable machine classification model
        const prediction = await model.predict(posenetOutput);
        arrayOut.set(prediction);

        // finally draw the poses
        drawPose(pose);
    }
}

function drawPose(pose) {
    if (poseCanvas) {
        poseCtx.drawImage(camCanvas, 0, 0);
        /*
        canvasTexture.unpackAlpha = false;
        canvasTexture.flip = false;
        canvasTexture.wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
        canvasTexture.image = poseCanvas;
        canvasTexture.initTexture(poseCanvas, CGL.Texture.FILTER_LINEAR);

        outTexture.set(null);
        outTexture.set(canvasTexture);
        */
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, poseCtx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, poseCtx);

            poseArrayOut.set(pose.keypoints);

        }
    }
}

//outTexture.set(CGL.Texture.getEmptyTexture(cgl));