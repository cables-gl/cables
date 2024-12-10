const render = op.inTrigger("render");
const trigger = op.outTrigger("trigger");

const eyeX = op.inValueFloat("eyeX");
const eyeY = op.inValueFloat("eyeY");
const eyeZ = op.inValueFloat("eyeZ");

const centerX = op.inValueFloat("centerX");
const centerY = op.inValueFloat("centerY");
const centerZ = op.inValueFloat("centerZ");

const vecUpX = op.inValueFloat("upX");
const vecUpY = op.inValueFloat("upY");
const vecUpZ = op.inValueFloat("upZ");

const outArr = op.outArray("Array");

centerX.set(0);
centerY.set(0);
centerZ.set(0);

eyeX.set(5);
eyeY.set(5);
eyeZ.set(5);

vecUpX.set(0);
vecUpY.set(1);
vecUpZ.set(0);

const cgl = op.patch.cgl;
const vUp = vec3.create();
const vEye = vec3.create();
const vCenter = vec3.create();
const transMatrix = mat4.create();
mat4.identity(transMatrix);

const arr = [];


render.onTriggered = function ()
{
    if (cgl.tempData.shadowPass) return trigger.trigger();


    if (op.isCurrentUiOp())
        gui.setTransformGizmo(
            {
                "posX": eyeX,
                "posY": eyeY,
                "posZ": eyeZ
            });


    cgl.pushViewMatrix();

    arr[0] = eyeX.get();
    arr[1] = eyeY.get();
    arr[2] = eyeZ.get();

    arr[3] = centerX.get();
    arr[4] = centerY.get();
    arr[5] = centerZ.get();

    arr[6] = vecUpX.get();
    arr[7] = vecUpY.get();
    arr[8] = vecUpZ.get();

    outArr.setRef(arr);

    vec3.set(vUp, vecUpX.get(), vecUpY.get(), vecUpZ.get());
    vec3.set(vEye, eyeX.get(), eyeY.get(), eyeZ.get());
    vec3.set(vCenter, centerX.get(), centerY.get(), centerZ.get());

    mat4.lookAt(transMatrix, vEye, vCenter, vUp);

    mat4.multiply(cgl.vMatrix, cgl.vMatrix, transMatrix);

    trigger.trigger();
    cgl.popViewMatrix();
};
