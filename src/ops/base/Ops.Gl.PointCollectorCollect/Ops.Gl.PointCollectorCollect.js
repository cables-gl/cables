const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;

let pos = vec3.create();
let empty = vec3.create();
let tempMat = mat4.create();

render.onTriggered = function ()
{
    if (!cgl.tempData.SplinePoints) return;

    if (cgl.tempData.SplinePointsInverseOriginalMatrix)
    {
        mat4.multiply(tempMat, cgl.tempData.SplinePointsInverseOriginalMatrix, cgl.mMatrix);
        vec3.transformMat4(pos, empty, tempMat);
    }
    else
    {
        vec3.transformMat4(pos, empty, cgl.mMatrix);
    }

    cgl.tempData.SplinePoints[cgl.tempData.SplinePointCounter + 0] = pos[0];
    cgl.tempData.SplinePoints[cgl.tempData.SplinePointCounter + 1] = pos[1];
    cgl.tempData.SplinePoints[cgl.tempData.SplinePointCounter + 2] = pos[2];

    cgl.tempData.SplinePointCounter += 3;

    trigger.trigger();
};
