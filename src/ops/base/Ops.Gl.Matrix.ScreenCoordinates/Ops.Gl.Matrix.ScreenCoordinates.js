var exec=op.addInPort(new CABLES.Port(op,"Execute",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.outTrigger('Trigger');

var x=op.addOutPort(new CABLES.Port(op,"X"));
var y=op.addOutPort(new CABLES.Port(op,"Y"));
// var z=op.addOutPort(new CABLES.Port(op,"Z"));

var cgl=op.patch.cgl;
var trans=vec3.create();
var m=mat4.create();
var pos=vec3.create();
var identVec=vec3.create();
exec.onTriggered=function()
{
    mat4.multiply(m,cgl.vMatrix,cgl.mvMatrix);
    vec3.transformMat4(pos, identVec, m);

    vec3.transformMat4(trans, pos, cgl.pMatrix);

    var vp=cgl.getViewPort();

    x.set(  (trans[0] * vp[2]/2) + vp[2]/2 );
    y.set(  (trans[1] * vp[3]/2) + vp[3]/2 );

    trigger.trigger();
};
