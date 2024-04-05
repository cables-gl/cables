const
    inTex = op.inTexture("Texture"),
    start = op.inTriggerButton("Trigger"),
    inFormat = op.inSwitch("Format", ["PNG", "JPEG", "WEBP"], "PNG"),
    inQuality = op.inFloatSlider("Quality", 0.9),

    dataUrl = op.inBool("Output dataUrl", true),
    outSize = op.outNumber("Binary Size"),
    outString = op.outString("Base64 string"),
    outLoading = op.outBoolNum("Loading"),
    finished = op.outTrigger("Finished");

const cgl = op.patch.cgl;
const gl = op.patch.cgl.gl;
let fb = null;
outString.ignoreValueSerialize = true;

const canvas = document.createElement("canvas");

let pixelReader = new CGL.PixelReader();

dataUrl.onChange =
    start.onTriggered = retrySoon;

inFormat.onChange = () =>
{
    inQuality.setUiAttribs({ "greyout": inFormat.get() == "PNG" });
    retrySoon();
};

function retrySoon()
{
    op.patch.cgl.addNextFrameOnceCallback(update.bind(this));
}

function update()
{
    op.uiAttr({ "error": null });
    if (!inTex.get() || !inTex.get().tex) return;
    outLoading.set(true);

    const width = inTex.get().width;
    const height = inTex.get().height;

    if (!fb)fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, inTex.get().tex, 0);

    const canRead = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (!canRead)
    {
        outLoading.set(true);
        op.uiAttr({ "error": "cannot read texture!" });
        return;
    }

    let retry = !pixelReader.read(cgl, fb, inTex.get().pixelFormat, 0, 0, width, height, (pixel) =>
    {
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        // Copy the pixels to a 2D canvas
        const imageData = context.createImageData(width, height);
        imageData.data.set(pixel);

        const data2 = imageData.data;

        // flip image
        Array.from({ "length": height }, (val, i) => { return data2.slice(i * width * 4, (i + 1) * width * 4); })
            .forEach((val, i) => { return data2.set(val, (height - i - 1) * width * 4); });

        context.putImageData(imageData, 0, 0);

        const ext = inFormat.get().toLowerCase();

        let dataString = "";

        dataString = canvas.toDataURL("image/" + ext, inQuality.get());

        if (!dataUrl.get())
        {
            dataString = dataString.split(",", 2)[1];
        }
        outString.set(dataString);

        outSize.set(Math.ceil(dataString.length * 0.75)); // 6 bit to 8 bit

        outLoading.set(false);
        finished.trigger();
    });

    if (retry) setTimeout(retrySoon.bind(this), 100);
}

//
