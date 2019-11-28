const inNNC = op.inObject("NNC Data");
const inSensibility = op.inValueFloat("sensibility", 0.5);

const outDetected = op.outBool("Detected");

const body = document.getElementsByTagName("body")[0];
var jeelizCanvas = document.createElement("canvas");
jeelizCanvas.id = "jeeGlanceTrackerCanvas_" + CABLES.generateUUID();
jeelizCanvas.style.display = "none";
jeelizCanvas.width = 640;
jeelizCanvas.height = 480;
body.appendChild(jeelizCanvas);

op.onDelete = function ()
{
    jeelizCanvas.remove();
};

inNNC.onChange = function ()
{
    if (!inNNC.get()) return;

    GLANCETRACKERAPI.init({
        canvasId: jeelizCanvas.id,
        NNC: inNNC.get(),
        sensibility: inSensibility.get(),
        isDisplayVideo: false,
        callbackReady(errCode, spec)
        {
            if (errCode)
            {
                console.log("jeeliz error:", errCode);
            }
        },
        callbackTrack(isWatching)
        {
            outDetected.set(isWatching);
        },
    });
};
