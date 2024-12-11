let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;

let m = mat4.create();
let pos = [0, 0, 0];
let trans = vec3.create();

render.onTriggered = function ()
{
    if (!cgl.tempData.SplinePoints) return;

    // vec3.transformMat4(pos, [0,0,0], cgl.mMatrix);

    mat4.multiply(m, cgl.vMatrix, cgl.mMatrix);
    vec3.transformMat4(pos, [0, 0, 0], m);

    vec3.transformMat4(trans, pos, cgl.pMatrix);

    let vp = cgl.getViewPort();

    cgl.tempData.SplinePoints[cgl.tempData.SplinePointCounter + 0] = vp[2] - (vp[2] * 0.5 - trans[0] * vp[2] * 0.5 / trans[2]);
    cgl.tempData.SplinePoints[cgl.tempData.SplinePointCounter + 1] = vp[3] - (vp[3] * 0.5 + trans[1] * vp[3] * 0.5 / trans[2]);

    cgl.tempData.SplinePointCounter += 2;

    trigger.trigger();
};
