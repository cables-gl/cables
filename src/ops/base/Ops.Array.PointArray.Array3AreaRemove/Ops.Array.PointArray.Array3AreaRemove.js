const cgl = op.patch.cgl;

const inTrigger = op.inTrigger("In Trigger");
const inArray = op.inArray("In Array", 3);
const inMode = op.inDropDown("Mode", [
    "Sphere",
    "Box",
    "Axis X",
    "Axis Y",
    "Axis Z",
    "Axis X Infinite",
    "Axis Y Infinite",
    "Axis Z Infinite"
], "Sphere");
const inSize = op.inFloat("Size", 0);
const inInvert = op.inBool("Invert", false);

op.setPortGroup("Settings", [inMode, inSize, inInvert]);
const inPosX = op.inFloat("X", 0);
const inPosY = op.inFloat("Y", 0);
const inPosZ = op.inFloat("Z", 0);

op.setPortGroup("Position", [inPosX, inPosY, inPosZ]);

const outTrigger = op.outTrigger("Out Trigger");
const outArray = op.outArray("Out Array");
const outLength = op.outNumber("Array Length");
const outX = op.outNumber("Out X");
const outY = op.outNumber("Out Y");
const outZ = op.outNumber("Out Z");

const transVec = vec3.create();

const tempVec = vec3.create();
const rootVec = vec3.fromValues(inPosX.get(), inPosY.get(), inPosZ.get());

let parametersChanged = true;
inArray.onChange = inMode.onChange = inSize.onChange = inInvert.onChange = inPosX.onChange = inPosY.onChange = inPosZ.onChange = () =>
{
    parametersChanged = true;
};

const DISCARD_FUNCS = {
    "Sphere": (inArr) =>
    {
        const newArr = [];
        const radiusSquared = inSize.get() * inSize.get();
        let CONDITION = (a, b) => { return a > b; };
        if (inInvert.get()) CONDITION = (a, b) => { return a < b; };

        for (let i = 0, len = inArr.length / 3; i < len; i += 1)
        {
            vec3.set(tempVec, inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            const distSquared = vec3.squaredDistance(tempVec, rootVec);

            if (CONDITION(distSquared, radiusSquared))
            {
                newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
        }

        return newArr;
    },
    "Box": (inArr) =>
    {
        const size = inSize.get();
        const newArr = [];
        for (let i = 0, len = inArr.length / 3; i < len; i += 1)
        {
            vec3.set(tempVec, inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);

            if (
                Math.abs(tempVec[1] - rootVec[1]) > size
                || Math.abs(tempVec[0] - rootVec[0]) > size
                || Math.abs(tempVec[2] - rootVec[2]) > size
            )
            {
                if (!inInvert.get()) newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
            else
            {
                if (inInvert.get()) newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
        }

        return newArr;
    },
    "Axis X": (inArr) =>
    {
        const size = inSize.get();
        const newArr = [];
        for (let i = 0, len = inArr.length / 3; i < len; i += 1)
        {
            if (Math.abs(inArr[i * 3] - rootVec[0]) > size)
            {
                if (!inInvert.get()) newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
            else
            {
                if (inInvert.get()) newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
        }

        return newArr;
    },
    "Axis Y": (inArr) =>
    {
        const size = inSize.get();
        const newArr = [];
        for (let i = 0, len = inArr.length / 3; i < len; i += 1)
        {
            if (Math.abs(inArr[i * 3 + 1] - rootVec[1]) > size)
            {
                if (!inInvert.get()) newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
            else
            {
                if (inInvert.get()) newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
        }

        return newArr;
    },
    "Axis Z": (inArr) =>
    {
        const size = inSize.get();
        const newArr = [];
        for (let i = 0, len = inArr.length / 3; i < len; i += 1)
        {
            if (Math.abs(inArr[i * 3 + 2] - rootVec[2]) > size)
            {
                if (!inInvert.get()) newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
            else
            {
                if (inInvert.get()) newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
        }

        return newArr;
    },
    "Axis X Infinite": (inArr) =>
    {
        const size = inSize.get();
        const newArr = [];
        for (let i = 0, len = inArr.length / 3; i < len; i += 1)
        {
            if (inArr[i * 3] - rootVec[0] > size)
            {
                if (!inInvert.get()) newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
            else
            {
                if (inInvert.get()) newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
        }

        return newArr;
    },
    "Axis Y Infinite": (inArr) =>
    {
        const size = inSize.get();
        const newArr = [];
        for (let i = 0, len = inArr.length / 3; i < len; i += 1)
        {
            if (inArr[i * 3 + 1] - rootVec[1] > size)
            {
                if (!inInvert.get()) newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
            else
            {
                if (inInvert.get()) newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
        }

        return newArr;
    },
    "Axis Z Infinite": (inArr) =>
    {
        const size = inSize.get();
        const newArr = [];
        for (let i = 0, len = inArr.length / 3; i < len; i += 1)
        {
            if (inArr[i * 3 + 2] - rootVec[2] > size)
            {
                if (!inInvert.get()) newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
            else
            {
                if (inInvert.get()) newArr.push(inArr[i * 3 + 0], inArr[i * 3 + 1], inArr[i * 3 + 2]);
            }
        }

        return newArr;
    },
};

inTrigger.onTriggered = () =>
{
    const inArr = inArray.get();
    drawHelpers();

    vec3.set(transVec, inPosX.get(), inPosY.get(), inPosZ.get());
    vec3.transformMat4(rootVec, transVec, cgl.mMatrix);

    if (!inArr)
    {
        outTrigger.trigger();
        outArray.set(null);
        return;
    }

    if (parametersChanged)
    {
        const newArr = DISCARD_FUNCS[inMode.get()](inArr);

        outArray.set(null);
        outArray.set(newArr);
        outLength.set(newArr.length);

        parametersChanged = false;
    }

    outX.set(rootVec[0]);
    outY.set(rootVec[1]);
    outZ.set(rootVec[2]);
    outTrigger.trigger();
};

const HELPER_FUNCS = {
    "Sphere": () => { return CABLES.GL_MARKER.drawSphere(op, inSize.get()); },
    "Box": () => { return CABLES.GL_MARKER.drawCube(op, inSize.get(), inSize.get(), inSize.get()); },
    "Axis X": () => { return CABLES.GL_MARKER.drawCube(op, inSize.get(), 2, 2); },
    "Axis Y": () => { return CABLES.GL_MARKER.drawCube(op, 2, inSize.get(), 2); },
    "Axis Z": () => { return CABLES.GL_MARKER.drawCube(op, 2, 2, inSize.get()); },
    "Axis X Infinite": () => { return CABLES.GL_MARKER.drawCube(op, inSize.get(), 2, 2); },
    "Axis Y Infinite": () => { return CABLES.GL_MARKER.drawCube(op, 2, inSize.get(), 2); },
    "Axis Z Infinite": () => { return CABLES.GL_MARKER.drawCube(op, 2, 2, inSize.get()); },
};

function drawHelpers()
{
    if (cgl.shouldDrawHelpers(op))
    {
        gui.setTransformGizmo({ "posX": inPosX, "posY": inPosY, "posZ": inPosZ });
        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix, cgl.mMatrix, rootVec);
        HELPER_FUNCS[inMode.get()]();
        cgl.popModelMatrix();
    }
}
