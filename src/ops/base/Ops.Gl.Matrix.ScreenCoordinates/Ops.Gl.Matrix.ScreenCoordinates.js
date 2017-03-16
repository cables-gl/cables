op.name="ScreenCoordinates";

var exec=op.addInPort(new Port(op,"Execute",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));

var x=op.addOutPort(new Port(op,"X"));
var y=op.addOutPort(new Port(op,"Y"));
// var z=op.addOutPort(new Port(op,"Z"));

var cgl=op.patch.cgl;
var trans=vec3.create();
var m=mat4.create();
var pos=[0,0,0];
exec.onTriggered=function()
{
    mat4.multiply(m,cgl.vMatrix,cgl.mvMatrix);
    vec3.transformMat4(pos, [0,0,0], m);
    
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    var vp=cgl.getViewPort();
    
    x.set( vp[2]-( vp[2]  * 0.5 - trans[0] * vp[2] * 0.5 / trans[2] ));
    y.set( vp[3]-( vp[3]  * 0.5 + trans[1] * vp[3] * 0.5 / trans[2] ));
    

    trigger.trigger();
};
