const
    start = op.inTriggerButton("Trigger"),
    inCanvas = op.inObject("Texture", "element"),
    inFormat = op.inSwitch("Format", ["PNG", "JPEG", "WEBP"], "PNG"),
    inQuality = op.inFloatSlider("Quality", 0.9),

    dataUrl = op.inBool("Output dataUrl", true),
    next = op.outTrigger("next"),
    outSize = op.outNumber("Binary Size"),
    outString = op.outString("Base64 string"),
    outLoading = op.outBoolNum("Loading"),
    finished = op.outTrigger("Finished");

const cgl = op.patch.cgl;
const gl = op.patch.cgl.gl;
const canvas = document.createElement("canvas");

let fb = null;
let texChanged = false;
let loadingId = null;
outString.ignoreValueSerialize = true;

// let pixelReader = new CGL.PixelReader();

start.onTriggered = () => { update(); };

inQuality.onChange =
inFormat.onChange =
inCanvas.onChange = () =>
{
    texChanged = true;
};

// function retrySoon()
// {
//     if (texChanged)
//     {
//         if (loadingId)loadingId = cgl.patch.loading.finished(loadingId);
//         outLoading.set(true);

//         loadingId = cgl.patch.loading.start(op.name, CABLES.uuid(), op);

//         op.patch.cgl.addNextFrameOnceCallback(update.bind(this));
//     }
//     inQuality.setUiAttribs({ "greyout": inFormat.get() == "PNG" });

//     next.trigger();
// }

function update()
{
    op.uiAttr({ "error": null });

    if (!inCanvas.get()) return;
    // const width = inCanvas.get().width;
    // const height = inCanvas.get().height;

    // const context = canvas.getContext("2d");
    // const imageData = context.createImageData(width, height);
    // imageData.data.set(pixel);

    //     const data2 = imageData.data;

    // flip image
    // Array.from({ "length": height }, (val, i) => { return data2.slice(i * width * 4, (i + 1) * width * 4); })
    // .forEach((val, i) => { return data2.set(val, (height - i - 1) * width * 4); });

    // context.putImageData(imageData, 0, 0);

    const ext = inFormat.get().toLowerCase();

    // let dataString = "";
    if (!inCanvas.get().toDataURL)
    {
        console.log("canvas has no toDataURL", inCanvas.get());
        return;
    }

    let dataString = inCanvas.get().toDataURL("image/" + ext, inQuality.get());

    if (!dataUrl.get())
    {
        dataString = dataString.split(",", 2)[1];
    }
    outString.set(dataString);

    outSize.set(Math.ceil(dataString.length * 0.75)); // 6 bit to 8 bit

    outLoading.set(false);
    texChanged = false;
    loadingId = cgl.patch.loading.finished(loadingId);
    finished.trigger();
    // });

    // if (retry) setTimeout(retrySoon.bind(this), 50);
}

//
