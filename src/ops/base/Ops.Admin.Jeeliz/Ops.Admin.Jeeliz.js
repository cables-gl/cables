
const
    nnc=op.inObject("NNC Data"),
    outDetected=op.outNumber("Detected"),
    rx=op.outNumber("rx"),
    ry=op.outNumber("ry"),
    rz=op.outNumber("rz"),
    s=op.outNumber("s"),
    x=op.outNumber("x"),
    y=op.outNumber("y"),
    outCanv=op.outObject("Canvas");

const body = document.getElementsByTagName("body")[0];
var jeelizCanvas = document.createElement('canvas');
jeelizCanvas.id = "jeeFaceFilterCanvas_"+CABLES.generateUUID();
jeelizCanvas.style.display = "none";
jeelizCanvas.width=640;
jeelizCanvas.height=480;
body.appendChild(jeelizCanvas);

// read this:
// https://github.com/jeeliz/jeelizFaceFilter/blob/master/helpers/JeelizThreejsHelper.js

op.onDelete=function()
{
    jeelizCanvas.remove();
};

nnc.onChange=function()
{
    if(!nnc.get()) return;

    JEEFACEFILTERAPI.init(
    {
        canvasId: jeelizCanvas.id,
        NNC:nnc.get(),
        callbackReady: function(errCode, spec){
            if (errCode){
                console.log('jeeliz error:', errCode);
                return;
            }
        },
        callbackTrack: function(detectState){
                outDetected.set(detectState.detected);
                rx.set(detectState.rx);
                ry.set(detectState.ry);
                rz.set(detectState.rz);
                s.set(detectState.s);
                x.set(detectState.x);
                y.set(detectState.y);
        }
    });
};