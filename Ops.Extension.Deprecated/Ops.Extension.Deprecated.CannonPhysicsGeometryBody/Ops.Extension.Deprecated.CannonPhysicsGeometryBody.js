const
    exec = op.inTrigger("Exec"),
    inShape = op.inSwitch("Shape", ["Box", "Sphere", "ConvexPolyhedron"], "Box"), // , "Trimesh"
    inName = op.inString("Name", ""),
    inMass = op.inValue("Mass", 0),
    inGeom = op.inObject("Geometry"),
    doRender = op.inValueBool("Render", true),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outX = op.outValue("X"),
    outY = op.outValue("Y"),
    outZ = op.outValue("Z"),
    outHit = op.outValueBool("Ray Hit", false),
    outCollision = op.outTrigger("Collision");

const cgl = op.patch.cgl;
// const wire = new CGL.WirePoint(cgl);
const vec = vec3.create();
const q = quat.create();
const empty = vec3.create();
const trMat = mat4.create();

let lastWorld = null;
let collided = false;
let needSetup = true;
let body = null;
let shape = null;
let bb = null;
let timeout = null;
let scale = vec3.create();
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
    removeBody();

    const geom = inGeom.get();

    if (!geom) return;

    modelScale = modelScale || 1;
    const world = cgl.tempData.world;
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
    if (inShape.get() == "ConvexPolyhedron")
    {
        const vecs = [];
        const faces = [];

        for (let i = 0; i < geom.vertices.length; i += 3)
            vecs.push(new CANNON.Vec3(geom.vertices[i + 0] * modelScale, geom.vertices[i + 1] * modelScale, geom.vertices[i + 2] * modelScale));

        for (let i = 0; i < geom.verticesIndices.length; i += 3)
            faces.push([geom.verticesIndices[i + 0], geom.verticesIndices[i + 1], geom.verticesIndices[i + 2]]);

        console.log("rebuild convecpoly");
        shape = new CANNON.ConvexPolyhedron(vecs, faces);

        // console.log(shape);

        // ---------

        const shapeGeom = new CGL.Geometry("convexpoly");
        const verts = [], ind = [];

        for (let i = 0; i < shape.vertices.length; i++)
            verts.push(shape.vertices[i].x / modelScale, shape.vertices[i].y / modelScale, shape.vertices[i].z / modelScale);

        for (let i = 0; i < shape.faces.length; i++)
        {
            ind.push(shape.faces[i][0], shape.faces[i][1]);
            ind.push(shape.faces[i][1], shape.faces[i][2]);
            ind.push(shape.faces[i][2], shape.faces[i][0]);
        }

        shapeGeom.vertices = verts;
        shapeGeom.verticesIndices = ind;

        shape.cbl_geom = shapeGeom;
        shape.cbl_mesh = null;
        shape.cbl_mat = mat4.create();
    }

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
    if (lastWorld != cgl.tempData.world)setup(modelScale);
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

        if (shape.cbl_mat)mat4.copy(shape.cbl_mat, cgl.mMatrix);

        mat4.getRotation(q, cgl.mMatrix);
        // quat.invert(q, q);

        // body.quaternion.x = q[0];
        // body.quaternion.y = q[1];
        // body.quaternion.z = q[2];
        // body.quaternion.w = q[3];

        quat.normalize(q, q);
        // body.quaternion.set(0, 0, 0, 1);
        // body.initQuaternion.set(q[0], q[1], q[2], q[3]);
        // // body.previousQuaternion.set(0,0,0,1);
        // body.interpolatedQuaternion.set(q[0], q[1], q[2], q[3]);

        body.quaternion.set(q[0], q[1], q[2], q[3]);
    }
    else
    {
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
    }

    if (shape.scale)
    {
        mat4.getScaling(scale, cgl.mMatrix);
        shape.setScale(new CANNON.Vec3(scale[0], scale[1], scale[2]));
        // shape.scale.x = scale[0];
        // shape.scale.y = scale[1];
        // shape.scale.z = scale[2];
    }

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
