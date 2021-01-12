const inExecute = op.inTrigger("Trigger In");
const initButton = op.inTriggerButton("Initialize");
const inUrl = op.inString("Model URL");
const webcamTex = op.inObject("Webcam texture");

const outTrigger = op.outTrigger("Trigger");
const loadingFinished = op.outTrigger("Initialized");
const arrayOut = op.outArray("Classifier");

inExecute.onTriggered = loop;
initButton.onTriggered = init;
inUrl.onChange = init;
webcamTex.onChange = loop;

let model;

const ele = document.createElement("canvas");
ele.id = "camImage_" + op.id; // instance id

const width = 200;
const height = 200;
const zoom = 1;

ele.style.position = "absolute";
ele.style.display = "none";
ele.style["z-index"] = 5;
ele.style.width = width + "px";
ele.style.height = height + "px";
ele.style["pointer-events"] = "none";
ele.style["transform-origin"] = "top left";
document.body.appendChild(ele);

const context = document.getElementById(ele.id).getContext("2d");

// Load the image model and setup the webcam
async function init()
{
    const baseUrl = inUrl.get();
    if (baseUrl)
    {
        op.uiAttr({ "error": null });
        const modelURL = baseUrl + "model.json";
        const metadataURL = baseUrl + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        model = await tmImage.load(modelURL, metadataURL);
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
    if (webcamTex.get() !== null)
    {
        if (webcamTex.get().videoElement !== undefined)
        {
            context.drawImage(webcamTex.get().videoElement, 0, 0, ele.width, ele.height);
            await predict();
        }
    }
    outTrigger.trigger();
}

// run the webcam image through the image model
async function predict()
{
    // predict can take in an image, video or canvas html element
    if (ele !== undefined && model !== undefined)
    {
        const prediction = await model.predict(ele);
        arrayOut.set(prediction);
    }
}
