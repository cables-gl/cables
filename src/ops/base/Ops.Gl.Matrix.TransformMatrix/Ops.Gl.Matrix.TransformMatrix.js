const
    inExec = op.inTriggerButton("Transform"),
    inArr = op.inArray("Matrix", 4),
    transX = op.inFloat("Translate X"),
    transY = op.inFloat("Translate Y"),
    transZ = op.inFloat("Translate Z"),
    scaleX = op.inFloat("Scale X", 1),
    scaleY = op.inFloat("Scale Y", 1),
    scaleZ = op.inFloat("Scale Z", 1),
    rotX = op.inFloat("Rotation X"),
    rotY = op.inFloat("Rotation Y"),
    rotZ = op.inFloat("Rotation Z"),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Result", 4);

op.setPortGroup("Translation", [transX, transY, transZ]);
op.setPortGroup("Scale", [scaleX, scaleY, scaleZ]);
op.setPortGroup("Rotation", [rotX, rotY, rotZ]);

let needsCalc = true;

inExec.onTriggered = doTransform;

inArr.onChange =
    transX.onChange = transY.onChange = transZ.onChange =
    scaleX.onChange = scaleY.onChange = scaleZ.onChange =
    rotX.onChange = rotY.onChange = rotZ.onChange = calcLater;

function calcLater()
{
    needsCalc = true;
}

function doTransform()
{
    let arr = inArr.get();
    if (!arr)
    {
        outArr.set(null);
        return;
    }

    const myMat = mat4.create();
    mat4.copy(myMat, arr);

    mat4.translate(myMat, myMat, [transX.get(), transY.get(), transZ.get()]);

    if (rotX.get() !== 0)mat4.rotateX(myMat, myMat, rotX.get() * CGL.DEG2RAD);
    if (rotY.get() !== 0)mat4.rotateY(myMat, myMat, rotY.get() * CGL.DEG2RAD);
    if (rotZ.get() !== 0)mat4.rotateZ(myMat, myMat, rotZ.get() * CGL.DEG2RAD);

    mat4.scale(myMat, myMat, [scaleX.get(), scaleY.get(), scaleZ.get()]);

    needsCalc = false;
    outArr.setRef(myMat);

    next.trigger();
}
