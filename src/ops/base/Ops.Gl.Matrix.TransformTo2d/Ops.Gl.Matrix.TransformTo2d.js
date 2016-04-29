op.name="TransformTo2d";

var exec=op.addInPort(new Port(op,"Execute",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));

var x=op.addOutPort(new Port(op,"X"));
var y=op.addOutPort(new Port(op,"Y"));
// var z=op.addOutPort(new Port(op,"Z"));

var cgl=op.patch.cgl;
var trans=vec3.create();
var m=mat4.create();
exec.onTriggered=function()
{
    var pos=[0,0,0];
    mat4.multiply(m,cgl.vMatrix,cgl.mvMatrix);
    vec3.transformMat4(pos, [0,0,0], m);

vec3.transformMat4(trans, pos, cgl.pMatrix);

// x.set((trans[0]+1.0)*cgl.getViewPort()[2]/2);
// y.set((1-trans[1])*cgl.getViewPort()[3]/2);
// z.set(trans[2]);
// x.set(cgl.getViewPort()[2]-( (trans[0])/trans[2]*cgl.getViewPort()[2]/4+cgl.getViewPort()[2]/2));
// y.set((trans[1])/trans[2]*cgl.getViewPort()[3]/4+cgl.getViewPort()[3]/2);
// z.set(trans[2]);

x.set( cgl.getViewPort()[2]-( cgl.getViewPort()[2]  * 0.5 - trans[0] * cgl.getViewPort()[2] * 0.5 / trans[2] ));
y.set( cgl.getViewPort()[3]-( cgl.getViewPort()[3]  * 0.5 + trans[1] * cgl.getViewPort()[3] * 0.5 / trans[2] ));


    trigger.trigger();
};
