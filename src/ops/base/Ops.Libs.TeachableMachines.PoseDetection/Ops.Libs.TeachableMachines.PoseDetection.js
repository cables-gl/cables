const inExecute = op.inTriggerButton("Render");
const initButton = op.inTriggerButton("Initialize");
const inUrl = op.inString("Model URL");
const webcamTex = op.inObject("Webcam texture");
const flipImage = op.inBool("Flip image");

let hasFlipped = false;
flipImage.onChange = checkFlip;
inExecute.onTriggered = loop;
initButton.onTriggered = init;
inUrl.onChange = init;
webcamTex.onChange = loop;

// output
const outTrigger = op.outTrigger("Trigger");
const loadingFinished = op.outTrigger("Initialized");
const arrayOut = op.outArray("Classifier");
const poseArrayOut = op.outArray("Pose positions");
const flipImageOut = op.outBool("Image flipped");

let model;

// canvas buffers
const width = 200;
const height = 200;
const zoom = 1;

const camCanvas = document.createElement("canvas");
camCanvas.id = "camImage_" + op.id; // instance id

camCanvas.style.position = "absolute";
camCanvas.style.display = "none";
camCanvas.style["z-index"] = 5;
camCanvas.style.width = width + "px";
camCanvas.style.height = height + "px";
camCanvas.style["pointer-events"] = "none";
camCanvas.style["transform-origin"] = "top right";
camCanvas.style.left = "80px";
camCanvas.style.top = "230px";
document.body.appendChild(camCanvas);

const camCtx = document.getElementById(camCanvas.id).getContext("2d");

const poseCanvas = document.createElement("canvas");
poseCanvas.id = "poseImage_" + arguments[2] || uuid(); // instance id

poseCanvas.style.position = "absolute";
poseCanvas.style.display = "none";
poseCanvas.style["z-index"] = 5;
poseCanvas.style.width = width + "px";
poseCanvas.style.height = height + "px";
poseCanvas.style["pointer-events"] = "none";
poseCanvas.style["transform-origin"] = "top right";
poseCanvas.style.left = "80px";
poseCanvas.style.top = "30px";
document.body.appendChild(poseCanvas);

const poseCtx = document.getElementById(poseCanvas.id).getContext("2d");

function checkFlip()
{
    hasFlipped = false;
    flipImageOut.set(flipImage.get());
}

// Load the image model and setup the webcam
async function init()
{
    const baseUrl = inUrl.get();
    if (baseUrl)
    {
        op.uiAttr({ "error": null });
        const modelURL = inUrl.get() + "model.json";
        const metadataURL = inUrl.get() + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        model = await tmPose.load(modelURL, metadataURL);
        loadingFinished.trigger();
    }
    else
    {
        op.uiAttr({ "error": "no baseurl set for the model, get one from teachablemachine" });
    }
}

async function loop()
{
    // draw camera texture onto canvas
    if (webcamTex.get() && webcamTex.get().videoElement)
    {
        if (hasFlipped == false)
        {
            camCtx.translate(camCanvas.width, 0);
            camCtx.scale(-1, 1);
            hasFlipped = true;
        }
        camCtx.drawImage(webcamTex.get().videoElement, 0, 0, camCanvas.width, camCanvas.height);
        await predict();
    }
    outTrigger.trigger();
}

// run the webcam image through the image model
async function predict()
{
    // predict can take in an image, video or canvas html element
    if (camCanvas !== undefined && model !== undefined)
    {
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

function drawPose(pose)
{
    if (poseCanvas)
    {
        poseCtx.drawImage(camCanvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose)
        {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, poseCtx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, poseCtx);

            poseArrayOut.set(pose.keypoints);
        }
    }
}
