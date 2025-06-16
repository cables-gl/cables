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

start.onTriggered = () => { update(); };

inQuality.onChange =
inFormat.onChange =
inCanvas.onChange = () =>
{
    texChanged = true;
};

function update()
{
    op.uiAttr({ "error": null });

    if (!inCanvas.get()) return;

    const ext = inFormat.get().toLowerCase();

    if (!inCanvas.get().toDataURL) return op.setUiError("error", "elment has no toDataURL");

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
}
