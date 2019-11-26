var render=op.inTrigger('render');
var trigger=op.outTrigger('trigger');

var eyeX=op.inValueFloat("eyeX");
var eyeY=op.inValueFloat("eyeY");
var eyeZ=op.inValueFloat("eyeZ");

var centerX=op.inValueFloat("centerX");
var centerY=op.inValueFloat("centerY");
var centerZ=op.inValueFloat("centerZ");

var vecUpX=op.inValueFloat("upX");
var vecUpY=op.inValueFloat("upY");
var vecUpZ=op.inValueFloat("upZ");

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
    outArr.set(null);
    outArr.set(arr);

    vec3.set(vUp, vecUpX.get(),vecUpY.get(),vecUpZ.get());
    vec3.set(vEye, eyeX.get(),eyeY.get(),eyeZ.get());
    vec3.set(vCenter, centerX.get(),centerY.get(),centerZ.get());

    mat4.lookAt(transMatrix, vEye, vCenter, vUp);

    mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrix);

    trigger.trigger();
    cgl.popViewMatrix();
};
