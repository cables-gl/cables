op.name = "SplinePoint";

let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;

render.onTriggered = function ()
{
    if (!cgl.frameStore.SplinePoints) return;
    let pos = [0, 0, 0];
    vec3.transformMat4(pos, [0, 0, 0], cgl.mvMatrix);

    cgl.frameStore.SplinePoints.push(pos[0]);
    cgl.frameStore.SplinePoints.push(pos[1]);
    cgl.frameStore.SplinePoints.push(pos[2]);

    trigger.trigger();
};
