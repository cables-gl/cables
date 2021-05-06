const
    inExec = op.inTriggerButton("Transform"),
    inArr = op.inArray("Array"),
    transX = op.inValue("Translate X"),
    transY = op.inValue("Translate Y"),
    transZ = op.inValue("Translate Z"),
    scaleX = op.inValueSlider("Scale X", 1),
    scaleY = op.inValueSlider("Scale Y", 1),
    scaleZ = op.inValueSlider("Scale Z", 1),
    rotX = op.inValue("Rotation X"),
    rotY = op.inValue("Rotation Y"),
    rotZ = op.inValue("Rotation Z"),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Result");

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
        outArr.set(null);
        outArr.set(resultArr);
    }
    next.trigger();
}
