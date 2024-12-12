op.name = "SplinePoint";

let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;

render.onTriggered = function ()
{
    if (!cglframeStoreSplinePoints) return;
    let pos = [0, 0, 0];
    vec3.transformMat4(pos, [0, 0, 0], cgl.mvMatrix);

    cglframeStoreSplinePoints.push(pos[0]);
    cglframeStoreSplinePoints.push(pos[1]);
    cglframeStoreSplinePoints.push(pos[2]);

    trigger.trigger();
};
