const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    outPoints = op.outArray("Points", null, 3);
    // outPoints=op.addOutPort(new CABLES.Port(op,"Points",CABLES.OP_PORT_TYPE_ARRAY)),

outPoints.ignoreValueSerialize = true;

let inAbsolute = op.inValueBool("Absolute", true);

let points = [];
let cgl = op.patch.cgl;

let oldSplinePoints = null;

let pos = vec3.create();
let empty = vec3.create();
let m = mat4.create();

let mySplinePoints = [];

render.onTriggered = function ()
{
    if (cgl.tempData.SplinePoints)
    {
        oldSplinePoints = cgl.tempData.SplinePoints;
        cgl.tempData.SplinePoints = [];
    }

    cgl.tempData.SplinePointCounter = 0;

    cgl.tempData.SplinePoints = mySplinePoints;// cgl.tempData.SplinePoints||[];

    if (cgl.tempData.SplinePointCounter != cgl.tempData.SplinePoints.length)
        cgl.tempData.SplinePoints.length = cgl.tempData.SplinePointCounter;

    if (!inAbsolute.get())
    {
        mat4.invert(m, cgl.mMatrix);
        cgl.tempData.SplinePointsInverseOriginalMatrix = m;
    }
    else
    {
        cgl.tempData.SplinePointsInverseOriginalMatrix = null;
    }

    trigger.trigger();

    outPoints.set(null);
    outPoints.set(cgl.tempData.SplinePoints);

    if (oldSplinePoints) cgl.tempData.SplinePoints = oldSplinePoints;
};
