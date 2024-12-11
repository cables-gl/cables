const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),

    eyeX = op.inValueFloat("eyeX", 5),
    eyeY = op.inValueFloat("eyeY", 5),
    eyeZ = op.inValueFloat("eyeZ", 5),

    quatX = op.inValueFloat("quatX", 0),
    quatY = op.inValueFloat("quatY", 0),
    quatZ = op.inValueFloat("quatZ", 0),
    quatW = op.inValueFloat("quatW", 0),

    vecUpX = op.inValueFloat("upX", 0),
    vecUpY = op.inValueFloat("upY", 1),
    vecUpZ = op.inValueFloat("upZ", 0);

const cgl = op.patch.cgl;
const vUp = vec3.create();
const vEye = vec3.create();
const vCenter = vec3.create();
const vQuat = quat.create();
const transMatrix = mat4.create();
mat4.identity(transMatrix);


// arr[i*3+0]=n._animTrans[0].getValue(t);

// arrRot[i*4+3]=n._animRot[3].getValue(t);


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

    quat.set(vQuat, quatX.get(), quatY.get(), quatZ.get(), quatW.get());

    vec3.set(vUp, vecUpX.get(), vecUpY.get(), vecUpZ.get());
    vec3.set(vEye, eyeX.get(), eyeY.get(), eyeZ.get());

    vec3.set(vCenter, 0, -1, 0);
    vec3.transformQuat(vCenter, vCenter, vQuat);
    vec3.normalize(vCenter, vCenter);
    vec3.add(vCenter, vCenter, vEye);

    mat4.lookAt(transMatrix, vEye, vCenter, vUp);

    mat4.multiply(cgl.vMatrix, cgl.vMatrix, transMatrix);

    trigger.trigger();
    cgl.popViewMatrix();
};
