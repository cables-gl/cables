const
    inExec = op.inTriggerButton("Transform"),
    inArr = op.inArray("Array", 3),
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
    outArr = op.outArray("Result", 3);

op.setPortGroup("Translation", [transX, transY, transZ]);
op.setPortGroup("Scale", [scaleX, scaleY, scaleZ]);
op.setPortGroup("Rotation", [rotX, rotY, rotZ]);

let resultArr = [];
let needsCalc = true;

let rotVec = vec3.create();
let emptyVec = vec3.create();
let transVec = vec3.create();
let centerVec = vec3.create();

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

    if (arr.length / 3 % 1 != 0.0)
    {
        op.setUiError("invalidelength", "invalid array length!");
        outArr.set(null);
        return;
    }
    else op.setUiError("invalidelength", null);

    if (needsCalc)
    {
        resultArr.length = arr.length;

        const nrotx = rotX.get();
        const nroty = rotY.get();
        const nrotz = rotZ.get();
        const scx = scaleX.get();
        const scy = scaleY.get();
        const scz = scaleZ.get();
        const transx = transX.get();
        const transy = transY.get();
        const transz = transZ.get();
        const doRot = nrotx || nroty || nrotz;

        for (let i = 0; i < arr.length; i += 3)
        {
            resultArr[i + 0] = arr[i + 0] * scx;
            resultArr[i + 1] = arr[i + 1] * scy;
            resultArr[i + 2] = arr[i + 2] * scz;

            resultArr[i + 0] = resultArr[i + 0] + transx;
            resultArr[i + 1] = resultArr[i + 1] + transy;
            resultArr[i + 2] = resultArr[i + 2] + transz;

            if (doRot)
            {
                vec3.set(rotVec,
                    resultArr[i + 0],
                    resultArr[i + 1],
                    resultArr[i + 2]);

                if (nrotx != 0) vec3.rotateX(rotVec, rotVec, transVec, nrotx * CGL.DEG2RAD);
                if (nroty != 0) vec3.rotateY(rotVec, rotVec, transVec, nroty * CGL.DEG2RAD);
                if (nrotz != 0) vec3.rotateZ(rotVec, rotVec, transVec, nrotz * CGL.DEG2RAD);

                resultArr[i + 0] = rotVec[0];
                resultArr[i + 1] = rotVec[1];
                resultArr[i + 2] = rotVec[2];
            }
        }

        needsCalc = false;
        outArr.setRef(resultArr);
    }
    next.trigger();
}
