const
    exec = op.inTrigger("Exec"),
    inName = op.inString("Name", "Sphere"),
    inMass = op.inValue("Mass"),
    inRadius = op.inValue("Radius", 1),
    doRender = op.inValueBool("Render", true),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outRadius = op.outValue("Out Radius"),
    outX = op.outValue("X"),
    outY = op.outValue("Y"),
    outZ = op.outValue("Z"),
    outHit = op.outValueBool("Ray Hit", false),
    outCollision = op.outTrigger("Collision");

const cgl = op.patch.cgl;
const wire = new CGL.WirePoint(cgl);
const vec = vec3.create();
const q = quat.create();
const empty = vec3.create();
const trMat = mat4.create();

let lastWorld = null;
let collided = false;
let needSetup = true;
let body = null;
let shape = null;

inMass.onChange =
    inRadius.onChange = setup;
exec.onTriggered = render;

op.toWorkNeedsParent("Ops.Exp.Gl.Physics.World");

inReset.onTriggered = function ()
{
    needSetup = true;
};

inName.onChange =
exec.onLinkChanged =
op.onDelete =
function ()
{
    if (body && lastWorld)lastWorld.removeBody(body);
    body = null;
    lastWorld = null;
};

function setup(modelScale)
{
    modelScale = modelScale || 1;
    const world = cgl.tempData.world;
    if (!world) return;

    if (body)world.removeBody(body);
    shape = new CANNON.Sphere(Math.max(0, inRadius.get() * modelScale));
    body = new CANNON.Body({
        "name": inName.get(),

        "mass": inMass.get(), // kg
        //   position: new CANNON.Vec3(posX.get(), posY.get(), posZ.get()), // m
        shape
    });
    body.name = inName.get();

    world.addBody(body);

    body.addEventListener("collide", function (e)
    {
        collided = true;
    });

    lastWorld = world;
    needSetup = false;
    outRadius.set(inRadius.get());
}

const scale = vec3.create();

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
    if (lastWorld != cgl.tempData.world)setup();
    if (!body) return;

    outHit.set(body.raycastHit);

    const staticPos = inMass.get() == 0;

    const modelScale = getScaling(cgl.mMatrix);
    // if(shape.radius!=inRadius.get()*modelScale) setup(modelScale);
    const r = inRadius.get() * modelScale;
    if (shape.radius != r)
    {
        body.shapes.length = 0;// removeShape(shape);

        shape.radius = r;
        body.addShape(shape);

        // shape.updateBoundingSphereRadius();
        body.updateBoundingRadius();
        // body.computeAABB();
    }

    if (staticPos)
    {
        vec3.transformMat4(vec, empty, cgl.mMatrix);
        body.position.x = vec[0];
        body.position.y = vec[1];
        body.position.z = vec[2];
    }
    else
    {
        vec3.set(vec,
            body.position.x,
            body.position.y,
            body.position.z
        );
    }

    quat.set(q,
        body.quaternion.x,
        body.quaternion.y,
        body.quaternion.z,
        body.quaternion.w);
    quat.invert(q, q);

    cgl.pushModelMatrix();

    if (!staticPos)
    {
        mat4.fromRotationTranslation(trMat, q, vec);
        mat4.mul(cgl.mMatrix, trMat, cgl.mMatrix);
    }

    if (doRender.get())wire.render(cgl, inRadius.get() * 2);
    if (CABLES.UI && cgl.shouldDrawHelpers(op))
    {
        // mat4.translate(cgl.mMatrix,cgl.mMatrix,[x.get(),y.get(),z.get()]);
        CABLES.GL_MARKER.drawSphere(op, inRadius.get());
    }

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
