const
    render=op.inTrigger("render"),
    inArr=op.inArray('Matrix'),
    trigger=op.outTrigger("trigger"),
    outX=op.outValue("Scaling");


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

    outX.set(getScaling(cgl.mMatrix));

    trigger.trigger();
};
