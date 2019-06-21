const
    render=op.inTrigger("render"),
    inArr=op.inArray('Matrix'),
    trigger=op.outTrigger("trigger"),
    outX=op.outValue("X"),
    outY=op.outValue("Y"),
    outZ=op.outValue("Z");

const cgl=op.patch.cgl;
const pos=vec3.create();
const identVec=vec3.create();
const iViewMatrix=mat4.create();

function getScaling(mat)
{
    var m31 = mat[8];
    var m32 = mat[9];
    var m33 = mat[10];
    return Math.hypot(m31, m32, m33);
}


render.onTriggered=function()
{
    if(!inArr.get())return;

    // mat4.invert(iViewMatrix,inArr.get());
    // vec3.transformMat4(pos, identVec,iViewMatrix );

    outX.set(getScaling(cgl.mMatrix));
    // outY.set(pos[1]);
    // outZ.set(pos[2]);

    trigger.trigger();
};
