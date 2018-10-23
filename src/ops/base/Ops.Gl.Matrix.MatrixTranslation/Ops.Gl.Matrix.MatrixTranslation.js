const render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
const inArr=op.inArray('Matrix');
const trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

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
