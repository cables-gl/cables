const inNNC = op.inObject("NNC Data");
const inConfidence = op.inValueFloat("confidence", 0.2);

const outDetected = op.outBool("Detected");
const outFace = op.outObject("Face");
const rx = op.outNumber("rx");
const ry = op.outNumber("ry");
const rz = op.outNumber("rz");
const s = op.outNumber("s");
const x = op.outNumber("x");
const y = op.outNumber("y");
const outPupilLeft = op.outNumber("Left pupil radius");
const outPupilRight = op.outNumber("Right pupil radius");

const body = document.getElementsByTagName("body")[0];
var jeelizCanvas = document.createElement("canvas");
jeelizCanvas.id = "jeeFaceFilterCanvas_" + CABLES.generateUUID();
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

    JEEFACETRANSFERAPI.init({
        canvasId: jeelizCanvas.id,
        NNCpath: inNNC.get(),
        callbackReady(errCode, spec)
        {
            if (errCode)
            {
                console.log("jeeliz error:", errCode);
            }
        },
        callbackTrack(detectState)
        {
            outDetected.set(detectState.detected >= inConfidence.get());
            outFace.set(detectState);
            outPupilLeft.set(detectState.pupilLeftRadius);
            outPupilRight.set(detectState.pupilRightRadius);
            rx.set(detectState.rx);
            ry.set(detectState.ry);
            rz.set(detectState.rz);
            s.set(detectState.s);
            x.set(detectState.x);
            y.set(detectState.y);
        },
    });
};
