const
    exec = op.inTrigger("Trigger"),
    inArr = op.inArray("Array"),
    inNum = op.inInt("Times", 0),
    inTransX = op.inFloat("Translate X", 0),
    inTransY = op.inFloat("Translate Y", 0),
    inTransZ = op.inFloat("Translate Z", 0),
    scaleX = op.inFloat("Scale X", 1),
    scaleY = op.inFloat("Scale Y", 1),
    scaleZ = op.inFloat("Scale Z", 1),
    rotX = op.inFloat("Rotation X"),
    rotY = op.inFloat("Rotation Y"),
    rotZ = op.inFloat("Rotation Z"),
    inPosArr = op.inArray("Position Array"),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Result", [], 3);

op.toWorkPortsNeedToBeLinked(inArr, exec);

const rotVec = vec3.create();
let zeroVec = vec3.create();
let needsUpdate = true;

inArr.onChange =
    inTransX.onChange =
    inTransY.onChange =
    inTransZ.onChange =
    scaleX.onChange =
    scaleY.onChange =
    scaleZ.onChange =
    rotX.onChange =
    rotY.onChange =
    rotZ.onChange =
    inNum.onChange =
    inPosArr.onChange = () =>
    {
        needsUpdate = true;
    };

exec.onTriggered = () =>
{
    if (needsUpdate)
    {
        needsUpdate = false;
        const arr = inArr.get();
        const newArr = [];

        if (!arr || arr.length == 0)
        {
            outArr.setRef(newArr);
            return;
        }
        newArr.length = arr.length;

        const posArr = inPosArr.get();
        const num = inNum.get();

        if (posArr && posArr.length != num)op.warn("position array must be num length");

        const stepX = inTransX.get() / num;
        const stepY = inTransY.get() / num;
        const stepZ = inTransZ.get() / num;

        const stepScaleX = scaleX.get() / num;
        const stepScaleY = scaleY.get() / num;
        const stepScaleZ = scaleZ.get() / num;

        const nrotx = rotX.get() / num;
        const nroty = rotY.get() / num;
        const nrotz = rotZ.get() / num;

        let addPosX = 0;
        let addPosY = 0;
        let addPosZ = 0;

        for (let j = 0; j < num; j++)
        {
            if (posArr)
            {
                addPosX = posArr[j * 3 + 0];
                addPosY = posArr[j * 3 + 1];
                addPosZ = posArr[j * 3 + 2];
            }

            for (let i = 0; i < arr.length; i += 3)
            {
                vec3.set(rotVec,
                    arr[i + 0],
                    arr[i + 1],
                    arr[i + 2]);

                if (nrotx != 0) vec3.rotateX(rotVec, rotVec, zeroVec, (nrotx * j) * CGL.DEG2RAD);
                if (nroty != 0) vec3.rotateY(rotVec, rotVec, zeroVec, (nroty * j) * CGL.DEG2RAD);
                if (nrotz != 0) vec3.rotateZ(rotVec, rotVec, zeroVec, (nrotz * j) * CGL.DEG2RAD);

                newArr[(j * arr.length) + i + 0] = rotVec[0] * (1 + j * stepScaleX) + (stepX * j) + addPosX;
                newArr[(j * arr.length) + i + 1] = rotVec[1] * (1 + j * stepScaleY) + (stepY * j) + addPosY;
                newArr[(j * arr.length) + i + 2] = rotVec[2] * (1 + j * stepScaleZ) + (stepZ * j) + addPosZ;
            }
        }

        outArr.setRef(newArr);
    }

    next.trigger();
};
