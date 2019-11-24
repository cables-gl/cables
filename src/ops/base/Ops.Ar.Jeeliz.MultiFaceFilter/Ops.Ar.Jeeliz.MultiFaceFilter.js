const inNNC = op.inObject("NNC Data");
const inNumFaces = op.inValueInt("max faces", 8);
const inConfidence = op.inValueFloat("confidence", 0.2);

const outDetected = op.outNumber("Detected");
const outFaces = op.outArray("Faces");
const outPositions = op.outArray("Postitions");
const outRotations = op.outArray("Rotations");
const outScales = op.outArray("Scales");
const outMouth = op.outArray("Mouth states");

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
        maxFacesDetected: inNumFaces.get(),
        callbackReady(errCode, spec)
        {
            if (errCode)
            {
                console.log("jeeliz error:", errCode);
            }
        },
        callbackTrack(detectState)
        {
            const faces = [];
            const positions = [];
            const rotations = [];
            const scales = [];
            const mouths = [];
            for (let i = 0; i < detectState.length; i++)
            {
                const face = detectState[i];
                if (face.detected >= inConfidence.get())
                {
                    faces.push(face);
                    positions.push(face.x, face.y);
                    rotations.push(face.rx * 90, face.ry * 90, face.rz * 90);
                    scales.push(face.s);
                    mouths.push(face.expressions[0]);
                }
            }
            outDetected.set(faces.length);
            outFaces.set(faces);
            outPositions.set(positions);
            outRotations.set(rotations);
            outScales.set(scales);
            outMouth.set(mouths);
        },
    });
};
