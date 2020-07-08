const
    exec = op.inTrigger("Exec"),
    inPositions = op.inArray("Positions"),
    inName = op.inString("Name", ""),
    inMass = op.inValue("Mass", 0),
    sizeX = op.inValue("sizeX", 1),
    sizeY = op.inValue("sizeY", 1),
    sizeZ = op.inValue("sizeZ", 1),
    doRender = op.inValueBool("Render", true),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outNum = op.outNumber("Total Bodies");

const cgl = op.patch.cgl;
const wire = new CGL.WirePoint(cgl, 1);
const vec = vec3.create();
const q = quat.create();
const empty = vec3.create();
const trMat = mat4.create();
const scale = vec3.create();

let lastWorld = null;

let needSetup = true;
const bodies = [];
const body = null;


exec.onTriggered = render;

op.toWorkNeedsParent("Ops.Exp.Gl.Physics.World");

inPositions.onChange =
    function ()
    {
        const pos = inPositions.get();
        if (!pos) return;
        if (pos.length / 3 != bodies.length) needSetup = true;
    };

inMass.onChange = sizeX.onChange = sizeY.onChange = sizeZ.onChange = inName.onChange = inReset.onTriggered =
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
        world = world || cgl.frameStore.world;
        if (bodies[i] && world)lastWorld.removeBody(bodies[i]);
    }

    bodies.length = 0;
}


function setup(modelScale)
{
    modelScale = modelScale || 1;
    const world = cgl.frameStore.world;
    if (!world) return;


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
        bodies.push(body);
        world.addBody(body);
    }

    lastWorld = world;
    needSetup = false;
    console.log("setup", bodies);
}

function getScaling(mat)
{
    const m31 = mat[8];
    const m32 = mat[9];
    const m33 = mat[10];
    return Math.hypot(m31, m32, m33);
}

function render()
{
    if (needSetup)setup();
    if (lastWorld != cgl.frameStore.world)setup();


    const staticPos = inMass.get() == 0;
    const modelScale = getScaling(cgl.mMatrix);

    const pos = inPositions.get();
    if (!pos || pos.length < 3) return;

    outNum.set(bodies.length);

    for (let i = 0; i < pos.length; i += 3)
    {
        const body = bodies[i / 3];

        if (!body) continue;
        if (staticPos)
        {
            vec3.transformMat4(vec, empty, cgl.mMatrix);
            body.position.x = vec[0] + pos[i + 0];
            body.position.y = vec[1] + pos[i + 1];
            body.position.z = vec[2] + pos[i + 2];
        }
        else
        {
            vec3.set(vec,
                body.position.x,
                body.position.y,
                body.position.z
            );
        }

        // quat.set(q,
        //     body.quaternion.x,
        //     body.quaternion.y,
        //     body.quaternion.z,
        //     body.quaternion.w);
        // quat.invert(q, q);

        // cgl.pushModelMatrix();
    }


    // outX.set(body.position.x);
    // outY.set(body.position.y);
    // outZ.set(body.position.z);

    // CABLES.physicsCurrentBody = body;

    next.trigger();

    // CABLES.physicsCurrentBody = null;
    // cgl.popModelMatrix();
}
