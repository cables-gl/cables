const inExecute = op.inTrigger("Trigger In"),
      initButton = op.inTriggerButton("Initialize"),
      inUrl = op.inString("Model URL"),
      inTex = op.inObject("Webcam texture"),
      outTrigger = op.outTrigger("Trigger"),
      outFinished = op.outValueBool("Finished"),
      loadingFinished = op.outTrigger("Initialized"),
      arrayOut = op.outArray("Classifier");

inExecute.onTriggered = loop;
initButton.onTriggered = init;
inUrl.onChange = init;
inTex.onChange = loop;

let model;
const gl = op.patch.cgl.gl;
let fb = null;


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
    if (!inTex.get() || !inTex.get().tex) return;
    outFinished.set(false);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const width = inTex.get().width;
    const height = inTex.get().height;

    if (!fb)fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, inTex.get().tex, 0);

    const canRead = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (!canRead)
    {
        outFinished.set(true);
        op.error("cannot read texture!");
        return;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    const data = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Create a 2D canvas to store the result
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    // Copy the pixels to a 2D canvas
    const imageData = context.createImageData(width, height);
    imageData.data.set(data);

    const data2 = imageData.data;

    // flip image
    Array.from({ "length": height }, (val, i) => data2.slice(i * width * 4, (i + 1) * width * 4))
        .forEach((val, i) => data2.set(val, (height - i - 1) * width * 4));

    context.putImageData(imageData, 0, 0);

    await predict(canvas);

    outFinished.set(true);
    outTrigger.trigger();
}

// run the webcam image through the image model
async function predict(ctx)
{
    // predict can take in an image, video or canvas html element
    if (ctx !== undefined && model !== undefined)
    {
        const prediction = await model.predict(ctx);
        arrayOut.set(prediction);
    }
}
