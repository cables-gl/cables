
op.name='LookatCamera';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var centerX=op.addInPort(new Port(op,"centerX"));
var centerY=op.addInPort(new Port(op,"centerY"));
var centerZ=op.addInPort(new Port(op,"centerZ"));

var eyeX=op.addInPort(new Port(op,"eyeX"));
var eyeY=op.addInPort(new Port(op,"eyeY"));
var eyeZ=op.addInPort(new Port(op,"eyeZ"));

var vecUpX=op.addInPort(new Port(op,"upX"));
var vecUpY=op.addInPort(new Port(op,"upY"));
var vecUpZ=op.addInPort(new Port(op,"upZ"));

centerX.set(0);
centerY.set(0);
centerZ.set(0);

eyeX.set(5);
eyeY.set(5);
eyeZ.set(5);

vecUpX.set(0);
vecUpY.set(1);
vecUpZ.set(0);

var cgl=op.patch.cgl;
var vUp=vec3.create();
var vEye=vec3.create();
var vCenter=vec3.create();
var transMatrix = mat4.create();
mat4.identity(transMatrix);


render.onTriggered=function()
{
    cgl.pushViewMatrix();

    vec3.set(vUp, vecUpX.get(),vecUpY.get(),vecUpZ.get());
    vec3.set(vEye, eyeX.get(),eyeY.get(),eyeZ.get());
    vec3.set(vCenter, centerX.get(),centerY.get(),centerZ.get());

    mat4.lookAt(transMatrix, vEye, vCenter, vUp);
    
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrix);

    trigger.trigger();
    cgl.popViewMatrix();
};
