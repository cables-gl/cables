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
    if (cgl.frameStore.SplinePoints)
    {
        oldSplinePoints = cgl.frameStore.SplinePoints;
        cgl.frameStore.SplinePoints = [];
    }

    cgl.frameStore.SplinePointCounter = 0;

    cgl.frameStore.SplinePoints = mySplinePoints;// cgl.frameStore.SplinePoints||[];

    if (cgl.frameStore.SplinePointCounter != cgl.frameStore.SplinePoints.length)
        cgl.frameStore.SplinePoints.length = cgl.frameStore.SplinePointCounter;

    if (!inAbsolute.get())
    {
        mat4.invert(m, cgl.mMatrix);
        cgl.frameStore.SplinePointsInverseOriginalMatrix = m;
    }
    else
    {
        cgl.frameStore.SplinePointsInverseOriginalMatrix = null;
    }

    trigger.trigger();

    outPoints.set(null);
    outPoints.set(cgl.frameStore.SplinePoints);

    if (oldSplinePoints) cgl.frameStore.SplinePoints = oldSplinePoints;
};
