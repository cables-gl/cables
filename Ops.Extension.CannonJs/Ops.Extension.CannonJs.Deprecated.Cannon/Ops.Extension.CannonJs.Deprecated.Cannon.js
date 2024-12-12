const exec = op.inTrigger("Exec");
const inMass = op.inValue("Mass");
const inRadius = op.inValue("Radius");

const doRender = op.inValueBool("Render", true);

const posX = op.inValue("Pos X");
const posY = op.inValue("Pos Y");
const posZ = op.inValue("Pos Z");

const dirX = op.inValue("dir X");
const dirY = op.inValue("dir Y");
const dirZ = op.inValue("dir Z");

const speed = op.inValue("Speed");

const inReset = op.inTriggerButton("Reset");
const inSpawn = op.inTriggerButton("Spawn");

const next = op.outTrigger("Next");
const outRadius = op.outValue("Out Radius");
const outX = op.outValue("X");
const outY = op.outValue("Y");
const outZ = op.outValue("Z");
const outIndex = op.outNumber("Index");

const outCollision = op.outTrigger("Collision");

const cgl = op.patch.cgl;

const m = new CGL.WirePoint(cgl);

exec.onTriggered = render;

let needSetup = true;
let needsSpawn = false;

inMass.onChange = setup;
inRadius.onChange = setup;
inSpawn.onTriggered = () => { needsSpawn = true; };

let lastWorld = null;

let collided = false;

let world = null;

inReset.onTriggered = function ()
{
    if (!world) return;
    for (let i = 0; i < bodies.length; i++)
    {
        world.removeBody(bodies[i]);
    }
    bodies.length = 0;
};

let bodies = [];

function spawn()
{
    needsSpawn = false;
    world = cgl.tempData.world;
    if (!world)
    {
        op.logError("cannon has no world");
        return;
    }

    const body = new CANNON.Body({
        "mass": inMass.get(), // kg
        "position": new CANNON.Vec3(posX.get(), posY.get(), posZ.get()), // m
        "shape": new CANNON.Sphere(inRadius.get())
    });

    const velo = speed.get();
    // body.velocity.set(Math.random()*velo,Math.random()*velo,Math.random()*velo);
    body.velocity.set(
        dirX.get() * velo,
        dirY.get() * velo,
        dirZ.get() * velo);

    bodies.push(body);
    world.addBody(body);

    body.addEventListener("collide", function (e)
    {
        // collided=true;
        // collision.trigger();
    });
}

function setup()
{
    world = cgl.tempData.world;
    if (!world) return;

    // if(body)world.removeBody(body);

    lastWorld = world;
    needSetup = false;
    outRadius.set(inRadius.get());
}

const vec = vec3.create();
const q = quat.create();

const trMat = mat4.create();
function render()
{
    if (needSetup)setup();
    if (lastWorld != cgl.tempData.world)setup();

    if (needsSpawn)spawn();

    for (let i = 0; i < bodies.length; i++)
    {
        const body = bodies[i];
        // if(!body)return;

        outIndex.set(i);

        vec3.set(vec,
            body.position.x,
            body.position.y,
            body.position.z
        );

        quat.set(q,
            body.quaternion.x,
            body.quaternion.y,
            body.quaternion.z,
            body.quaternion.w);
        quat.invert(q, q);

        cgl.pushModelMatrix();

        mat4.fromRotationTranslation(trMat, q, vec);
        mat4.mul(cgl.mMatrix, trMat, cgl.mMatrix);

        if (doRender.get())m.render(cgl, inRadius.get() * 2);

        outX.set(body.position.x);
        outY.set(body.position.y);
        outZ.set(body.position.z);

        if (collided)
        {
            collided = false;
            outCollision.trigger();
        }

        CABLES.physicsCurrentBody = body;

        next.trigger();

        CABLES.physicsCurrentBody = null;
        cgl.popModelMatrix();
    }
}
