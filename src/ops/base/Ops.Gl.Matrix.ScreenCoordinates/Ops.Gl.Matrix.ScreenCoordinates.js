const
    exec=op.inTrigger("Execute"),
    trigger=op.outTrigger('Trigger'),
    x=op.outValue("X"),
    y=op.outValue("Y"),
    visi=op.outValue("Visible");

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

    const xp=(trans[0] * vp[2]/2) + vp[2]/2;
    const yp=(trans[1] * vp[3]/2) + vp[3]/2;

    x.set(xp);
    y.set(yp);

    visi.set( pos[2]<0.0 && xp>0 && xp<vp[2] && yp>0 && yp<vp[3] );

    trigger.trigger();
};
