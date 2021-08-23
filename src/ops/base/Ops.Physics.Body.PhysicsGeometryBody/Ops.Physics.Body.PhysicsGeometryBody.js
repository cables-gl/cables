const
    exec = op.inTrigger("Exec"),
    inShape = op.inSwitch("Shape", ["Box", "Sphere"], "Box"),
    inName = op.inString("Name", ""),
    inMass = op.inValue("Mass", 0),
    inGeom = op.inObject("Geometry"),
    doRender = op.inBool("Render", true),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outX = op.outValue("X"),
    outY = op.outValue("Y"),
    outZ = op.outValue("Z"),
    outHit = op.outValueBool("Ray Hit", false),
    outCollision = op.outTrigger("Collision");

const cgl = op.patch.cgl;
const wire = new CGL.WirePoint(cgl, 1);
const vec = vec3.create();
const q = quat.create();
const empty = vec3.create();
const trMat = mat4.create();
const scale = vec3.create();

let lastWorld = null;
let collided = false;
let needSetup = true;
let body = null;
let shape = null;
let bb = null;
let timeout = null;
exec.onTriggered = render;
let oldmodelScale = 0.0;
op.toWorkNeedsParent("Ops.Gl.Physics.World");

inShape.onChange =
inMass.onChange =
inGeom.onChange =
inReset.onTriggered = function ()
{
    needSetup = true;
};

exec.onLinkChanged =
    inName.onChange =
    op.onDelete = () =>
    {
        removeBody();
        lastWorld = null;
    };

function removeBody()
{
    if (body && lastWorld)lastWorld.removeBody(body);
    body = null;
}

function setup(modelScale)
{
    const geom = inGeom.get();

    if (!geom)
    {
        removeBody();
        return;
    }

    modelScale = modelScale || 1;
    const world = cgl.frameStore.world;
    if (!world) return;

    if (body)lastWorld.removeBody(body);

    bb = new CGL.BoundingBox(geom);

    // bb.mulMat4(cgl.mMatrix);

    op.log(bb);

    oldmodelScale = modelScale;

    if (inShape.get() == "Sphere") shape = new CANNON.Sphere(Math.max(0, 1.0 * modelScale));
    if (inShape.get() == "Box") shape = new CANNON.Box(new CANNON.Vec3(
        bb._size[0] * 0.5 * modelScale,
        bb._size[1] * 0.5 * modelScale,
        bb._size[2] * 0.5 * modelScale));
    if (inShape.get() == "Trimesh") shape = new CANNON.Trimesh(geom.vertices, geom.verticesIndices);

    body = new CANNON.Body({
        "name": inName.get(),
        "mass": inMass.get(), // kg
        "shape": shape
    });

    body.name = inName.get();

    world.addBody(body);

    body.addEventListener("collide", function (e)
    {
        collided = true;
    });

    lastWorld = world;
    needSetup = false;
}

function getScaling(mat)
{
    const m31 = mat[8];
    const m32 = mat[9];
    const m33 = mat[10];
    return Math.hypot(m31, m32, m33);
}

function stoppedRendering()
{
    removeBody();
    needSetup = true;
}

function render()
{
    clearTimeout(timeout);
    timeout = setTimeout(stoppedRendering, 300);
    const modelScale = getScaling(cgl.mMatrix);

    if (needSetup)setup(modelScale);
    if (lastWorld != cgl.frameStore.world)setup(modelScale);
    if (!body) return;

    if (oldmodelScale != modelScale)setup(modelScale);

    outHit.set(body.raycastHit);

    const staticPos = inMass.get() == 0;

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
