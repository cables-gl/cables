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
const outMouth = op.outArray("Mouth state");

const body = document.getElementsByTagName("body")[0];
var jeelizCanvas = document.createElement("canvas");
jeelizCanvas.id = "jeeFaceFilterCanvas_" + CABLES.generateUUID();
jeelizCanvas.style.display = "none";
jeelizCanvas.width = 640;
jeelizCanvas.height = 480;
body.appendChild(jeelizCanvas);

// read this:
// https://github.com/jeeliz/jeelizFaceFilter/blob/master/helpers/JeelizThreejsHelper.js

op.onDelete = function ()
{
    jeelizCanvas.remove();
};

inNNC.onChange = function ()
{
    if (!inNNC.get()) return;

    JEEFACEFILTERAPI.init({
        canvasId: jeelizCanvas.id,
        NNC: inNNC.get(),
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
            outMouth.set(detectState.expressions[0]);
            rx.set(detectState.rx * 90);
            ry.set(detectState.ry * 90);
            rz.set(detectState.rz * 90);
            s.set(detectState.s);
            x.set(detectState.x);
            y.set(detectState.y);
        },
    });
};
