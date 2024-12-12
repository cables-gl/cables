const
    exec = op.inTrigger("Exec"),
    inPositions = op.inArray("Positions"),
    inName = op.inString("Name", ""),
    inMass = op.inValue("Mass", 0),
    sizeX = op.inValue("sizeX", 1),
    sizeY = op.inValue("sizeY", 1),
    sizeZ = op.inValue("sizeZ", 1),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    resultArrPos = op.outArray("Simulated Positions"),
    outNames = op.outArray("Names"),
    outNum = op.outNumber("Total Bodies");

const cgl = op.patch.cgl;
const wire = new CGL.WirePoint(cgl);
const vec = vec3.create();
const q = quat.create();
const empty = vec3.create();
const trMat = mat4.create();
const scale = vec3.create();

let lastWorld = null;

let needSetup = true;
const bodies = [];
const body = null;
let skipSimulation = false;

exec.onTriggered = render;

// op.toWorkNeedsParent("Ops.Physics.World");

inPositions.onChange =
    function ()
    {
        const pos = inPositions.get();
        // if (!pos)
        // {
        //     removeBodies(lastWorld);
        // }
        if (!pos || pos.length / 3 != bodies.length)
        {
            needSetup = true;
            removeBodies(lastWorld);
            skipSimulation = true;
            return;
        }
        setBodyPositions();
    };

inReset.onTriggered = () =>
{
    const staticPos = inMass.get() == 0;
    if (staticPos)
    {
        setBodyPositions();
    }
    skipSimulation = true;
};

inMass.onChange = sizeX.onChange = sizeY.onChange = sizeZ.onChange = inName.onChange =
    function ()
    {
        needSetup = true;
    };

exec.onLinkChanged = op.onDelete =
    function ()
    {
        removeBodies(lastWorld);
        lastWorld = null;
    };

function removeBodies(world)
{
    for (let i = 0; i < bodies.length; i++)
    {
        world = world || cgl.tempData.world;
        if (bodies[i] && world)lastWorld.removeBody(bodies[i]);
    }

    resultsPositions.length = 0;
    resultArrPos.set(null);
    resultArrPos.set(resultsPositions);

    bodies.length = 0;
}

function setup(modelScale)
{
    modelScale = modelScale || 1;
    const world = cgl.tempData.world;
    if (!world) return;

    const names = [];

    const pos = inPositions.get();
    if (!pos || pos.length < 3) return;

    removeBodies();

    for (let i = 0; i < pos.length; i += 3)
    {
        // shape = new CANNON.Sphere(Math.max(0, inRadius.get() * modelScale));
        const shape = new CANNON.Box(new CANNON.Vec3(sizeX.get() * 0.5, sizeY.get() * 0.5, sizeZ.get() * 0.5));
        const body = new CANNON.Body({
            "mass": inMass.get(), // kg
            "shape": shape
        });

        body.name = inName.get() + "." + (i / 3);
        names.push(body.name);

        bodies.push(body);
        world.addBody(body);
    }

    outNames.set(names);
    lastWorld = world;
    setBodyPositions();
    needSetup = false;
    skipSimulation = true;
}

function getScaling(mat)
{
    const m31 = mat[8];
    const m32 = mat[9];
    const m33 = mat[10];
    return Math.hypot(m31, m32, m33);
}

const resultsPositions = [];

function setSimulatedPositions(pos)
{
    for (let i = 0; i < pos.length; i += 3)
    {
        const body = bodies[i / 3];

        if (!body) continue;

        vec3.set(vec,
            body.position.x,
            body.position.y,
            body.position.z
        );

        resultsPositions[i + 0] = vec[0];
        resultsPositions[i + 1] = vec[1];
        resultsPositions[i + 2] = vec[2];

        // quat.set(q,
        //     body.quaternion.x,
        //     body.quaternion.y,
        //     body.quaternion.z,
        //     body.quaternion.w);
        // quat.invert(q, q);

        // cgl.pushModelMatrix();
    }
}

function setBodyPositions(pos)
{
    if (!pos)pos = inPositions.get();

    const vpos = vec3.create();

    for (let i = 0; i < pos.length; i += 3)
    {
        const body = bodies[i / 3];

        if (!body) continue;

        // vec3.transformMat4(vec, empty, cgl.mMatrix);
        // resultsPositions[i + 0] = body.position.x = vec[0] + pos[i + 0];
        // resultsPositions[i + 1] = body.position.y = vec[1] + pos[i + 1];
        // resultsPositions[i + 2] = body.position.z = vec[2] + pos[i + 2];

        vpos[0] = pos[i + 0];
        vpos[1] = pos[i + 1];
        vpos[2] = pos[i + 2];
        vec3.transformMat4(vpos, vpos, cgl.mMatrix);
        resultsPositions[i + 0] = body.position.x = vpos[0];
        resultsPositions[i + 1] = body.position.y = vpos[1];
        resultsPositions[i + 2] = body.position.z = vpos[2];
    }
}

function updatePositions()
{
    const staticPos = inMass.get() == 0;
    const modelScale = getScaling(cgl.mMatrix);

    const pos = inPositions.get();
    if (!pos || pos.length < 3) return false;

    resultsPositions.length = pos.length;

    if (staticPos)
    {
        setBodyPositions(pos);
    }
    else
    {
        setSimulatedPositions(pos);
    }

    return true;
}

function render()
{
    if (needSetup) setup();
    if (lastWorld != cgl.tempData.world) setup();

    outNum.set(bodies.length);

    if (inMass.get() == 0.0)
    {
        for (let i = 0; i < bodies.length; i++)
        {
            bodies[i].mass = 0;
            bodies[i].velocity.set(0, 0, 0);
            bodies[i].angularVelocity.set(0, 0, 0);
            bodies[i].updateMassProperties();
        }
    }

    if (!skipSimulation || inMass.get() === 0) updatePositions();

    skipSimulation = false;

    resultArrPos.set(null);
    resultArrPos.set(resultsPositions);

    next.trigger();
}
