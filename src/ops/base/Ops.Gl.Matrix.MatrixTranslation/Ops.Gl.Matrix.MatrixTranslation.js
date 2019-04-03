const render=op.inTrigger("render");
const inArr=op.inArray('Matrix');
const trigger=op.outTrigger("trigger");

const outX=op.outValue("X");
const outY=op.outValue("Y");
const outZ=op.outValue("Z");

const cgl=op.patch.cgl;
const pos=vec3.create();
const identVec=vec3.create();
const iViewMatrix=mat4.create();


render.onTriggered=function()
{
    if(!inArr.get())return;

    mat4.invert(iViewMatrix,inArr.get());
    vec3.transformMat4(pos, identVec,iViewMatrix );

    outX.set(pos[0]);
    outY.set(pos[1]);
    outZ.set(pos[2]);

    trigger.trigger();
};
