op.name = "SplinePoint";

let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;

render.onTriggered = function ()
{
    if (!cgl.tempData.SplinePoints) return;
    let pos = [0, 0, 0];
    vec3.transformMat4(pos, [0, 0, 0], cgl.mvMatrix);

    cgl.tempData.SplinePoints.push(pos[0]);
    cgl.tempData.SplinePoints.push(pos[1]);
    cgl.tempData.SplinePoints.push(pos[2]);

    trigger.trigger();
};
