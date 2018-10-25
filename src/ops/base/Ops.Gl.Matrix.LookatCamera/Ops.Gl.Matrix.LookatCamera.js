var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var eyeX=op.addInPort(new CABLES.Port(op,"eyeX"));
var eyeY=op.addInPort(new CABLES.Port(op,"eyeY"));
var eyeZ=op.addInPort(new CABLES.Port(op,"eyeZ"));

var centerX=op.addInPort(new CABLES.Port(op,"centerX"));
var centerY=op.addInPort(new CABLES.Port(op,"centerY"));
var centerZ=op.addInPort(new CABLES.Port(op,"centerZ"));

var vecUpX=op.addInPort(new CABLES.Port(op,"upX"));
var vecUpY=op.addInPort(new CABLES.Port(op,"upY"));
var vecUpZ=op.addInPort(new CABLES.Port(op,"upZ"));

var outArr=op.outArray("Array");

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

var arr=[];


render.onTriggered=function()
{
    
    if(CABLES.UI && gui.patch().isCurrentOp(op)) 
        gui.setTransformGizmo(
            {
                posX:eyeX,
                posY:eyeY,
                posZ:eyeZ
            });


    cgl.pushViewMatrix();
    
    arr[0]=eyeX.get();
    arr[1]=eyeY.get();
    arr[2]=eyeZ.get();

    arr[3]=centerX.get();
    arr[4]=centerY.get();
    arr[5]=centerZ.get();

    arr[6]=vecUpX.get();
    arr[7]=vecUpY.get();
    arr[8]=vecUpZ.get();
    outArr.set(arr);

    vec3.set(vUp, vecUpX.get(),vecUpY.get(),vecUpZ.get());
    vec3.set(vEye, eyeX.get(),eyeY.get(),eyeZ.get());
    vec3.set(vCenter, centerX.get(),centerY.get(),centerZ.get());

    mat4.lookAt(transMatrix, vEye, vCenter, vUp);
    
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrix);

    trigger.trigger();
    cgl.popViewMatrix();
};
