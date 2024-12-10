const
    shapes = ["Sphere", "BoxAA", "Point"],
    trigger = op.inTrigger("Trigger"),
    inArea = op.inSwitch("Shape", shapes, "Sphere"),
    inName = op.inString("Name", ""),
    inRadius = op.inFloat("Radius", 0.5),
    inSizeX = op.inFloat("Size X", 1),
    inSizeY = op.inFloat("Size Y", 1),
    inSizeZ = op.inFloat("Size Z", 1),
    inPositions = op.inArray("Positions", null, 3),
    inPosIndex = op.inBool("Append Index to name", true),
    next = op.outTrigger("Next");

op.setPortGroup("Array", [inPositions, inPosIndex]);

const cgl = op.patch.cgl;
const pos = vec3.create();
const empty = vec3.create();

updateUi();

let objs = [];
let obj =
{
    "name": "???",
    "type": 1,
};

trigger.onTriggered = render;

function getCopyObj()
{
    return { "name": obj.name, "type": obj.type };
}

inArea.onChange = () =>
{
    obj.type = shapes.indexOf(inArea.get()) + 1;
    updateUi();
};

function updateUi()
{
    inRadius.setUiAttribs({ "greyout": inArea.get() != "Sphere" });
    inSizeX.setUiAttribs({ "greyout": inArea.get() != "BoxAA" });
    inSizeY.setUiAttribs({ "greyout": inArea.get() != "BoxAA" });
    inSizeZ.setUiAttribs({ "greyout": inArea.get() != "BoxAA" });
}

function setBox(o)
{
    o.minX = o.pos[0] - o.size[0] / 2;
    o.maxX = o.pos[0] + o.size[0] / 2;

    o.minY = o.pos[1] - o.size[1] / 2;
    o.maxY = o.pos[1] + o.size[1] / 2;

    o.minZ = o.pos[2] - o.size[2] / 2;
    o.maxZ = o.pos[2] + o.size[2] / 2;
}

const SHAPE_SPHERE = 1;
const SHAPE_AABB = 2;
const SHAPE_POINT = 3;

function renderOverlay(body)
{
    if (!CABLES.UI) return;
    if (!cgl.shouldDrawHelpers(op)) return;
    // const collisions = [];
    // const bodies = cgl.tempData.collisionWorld.bodies;

    // for (let i = 0; i < bodies.length; i++)
    // {
    // const body = bodies[i];

    if (body.type === SHAPE_SPHERE) // sphere
    {
        // console.log("sphere")
        cgl.pushModelMatrix();
        // mat4.translate(cgl.mMatrix, cgl.mMatrix, body.pos);
        CABLES.UI.OverlayMeshes.drawSphere(op, body.radius, true);
        cgl.popModelMatrix();
    }
    else if (body.type === SHAPE_AABB) // AABB
    {
        cgl.pushModelMatrix();
        // mat4.translate(cgl.mMatrix, cgl.mMatrix, body.pos);
        CABLES.UI.OverlayMeshes.drawCube(op, body.size[0] / 2, body.size[1] / 2, body.size[2] / 2);
        cgl.popModelMatrix();
    }
    else if (body.type === SHAPE_POINT) // point
    {
        cgl.pushModelMatrix();
        // mat4.translate(cgl.mMatrix, cgl.mMatrix, body.pos);
        CABLES.UI.OverlayMeshes.drawAxisMarker(op, 0.05);
        cgl.popModelMatrix();
    }
    else console.warn("[intersectWorld] unknown col shape");

    // }
}

function render()
{
    if (!cgl.tempData || !cgl.tempData.collisionWorld) return;
    const cg = op.patch.cgl;

    // vec3.transformMat4(pos, empty, cg.mMatrix);
    // mat4.getScaling(scale, cg.mMatrix);

    const posArr = inPositions.get();
    const radius = inRadius.get();

    if (posArr && posArr.length > 0 && posArr.length % 3 == 0)
    {
        objs.length = posArr.length / 3;
        for (let i = 0; i < posArr.length; i += 3)
        {
            const o = objs[i / 3] || {};
            if (inPosIndex.get()) o.name = inName.get() + "." + i / 3;
            else o.name = inName.get();

            o.pos = [posArr[i + 0], posArr[i + 1], posArr[i + 2]];
            vec3.transformMat4(o.pos, o.pos, cg.mMatrix);

            // vec3.mul(o.pos, o.pos, scale);
            o.type = obj.type;
            o.size = [inSizeX.get(), inSizeY.get(), inSizeZ.get()];

            if (o.type == 2)setBox(o);
            if (o.type == 1)o.radius = radius;

            cgl.tempData.collisionWorld.bodies.push(o);
            renderOverlay(o);
        }
    }
    else
    {
        const objCopy = getCopyObj();
        cgl.tempData.collisionWorld.bodies.push(objCopy);
        objCopy.name = inName.get();
        objCopy.pos = [0, 0, 0];

        vec3.transformMat4(objCopy.pos, objCopy.pos, cg.mMatrix);

        objCopy.size = [inSizeX.get(), inSizeY.get(), inSizeZ.get()];

        if (objCopy.type == 2)setBox(objCopy);
        if (objCopy.type == 1)objCopy.radius = radius;
        renderOverlay(objCopy);
    }

    next.trigger();
}
