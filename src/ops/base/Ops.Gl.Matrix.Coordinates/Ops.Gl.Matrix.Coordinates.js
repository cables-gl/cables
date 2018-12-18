const render=op.inTrigger('render');
const trigger=op.outTrigger('trigger');
const outX=op.outValue("X");
const outY=op.outValue("Y");
const outZ=op.outValue("Z");

const cgl=op.patch.cgl;
const pos=vec3.create();
const empty=vec3.create();

render.onTriggered=function()
{
    vec3.transformMat4(pos, empty, cgl.mMatrix);

    outX.set(pos[0]);
    outY.set(pos[1]);
    outZ.set(pos[2]);

    trigger.trigger();
};
