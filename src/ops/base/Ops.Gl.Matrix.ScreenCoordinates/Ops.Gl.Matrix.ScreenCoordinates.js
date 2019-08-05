const
    exec=op.inTrigger("Execute"),
    trigger=op.outTrigger('Trigger'),
    x=op.outValue("X"),
    y=op.outValue("Y");


const cgl=op.patch.cgl;
var trans=vec3.create();
var m=mat4.create();
var pos=vec3.create();
var identVec=vec3.create();

exec.onTriggered=function()
{
    mat4.multiply(m,cgl.vMatrix,cgl.mMatrix);
    vec3.transformMat4(pos, identVec, m);

    vec3.transformMat4(trans, pos, cgl.pMatrix);

    var vp=cgl.getViewPort();

    x.set(  (trans[0] * vp[2]/2) + vp[2]/2 );
    y.set(  (trans[1] * vp[3]/2) + vp[3]/2 );

    trigger.trigger();
};
