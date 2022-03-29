const
    inExec = op.inTrigger("Update"),
    inName = op.inString("Name", ""),
    inMass = op.inFloat("Mass", 0),
    inShape = op.inDropDown("Shape", ["Box", "Sphere", "Cylinder", "Capsule", "Cone", "Geom Convex Hull"], "Box"),
    inGeom = op.inObject("Geometry", null, "geometry"),
    inGeomSimplify = op.inInt("Simplify Max Triangles", 50),
    inRadius = op.inFloat("Radius", 1),
    inSizeX = op.inFloat("Size X", 1),
    inSizeY = op.inFloat("Size Y", 1),
    inSizeZ = op.inFloat("Size Z", 1),
    inReset = op.inTriggerButton("Reset"),
    inActivate = op.inTriggerButton("Activate"),
    inNeverDeactivate = op.inBool("Never Deactivate"),
    inActive = op.inBool("Active", true),

    next = op.outTrigger("next"),
    outRayHit = op.outBoolNum("Ray Hit"),
    transformed = op.outTrigger("Transformed");

inExec.onTriggered = update;

const cgl = op.patch.cgl;
let body = null;
let world = null;
let tmpTrans = null;
let transform = null;
let motionState = null;
const tmpOrigin = vec3.create();
const tmpQuat = quat.create();
const tmpScale = vec3.create();
let transMat = mat4.create();

let btOrigin = null;
let btQuat = null;
let doResetPos = false;
let colShape = null;
let doScale = true;
inName.onChange = updateBodyMeta;

inExec.onLinkChanged =
    op.onDelete =
    inGeomSimplify.onChange =
    inActive.onChange =
    inGeom.onChange =
    inShape.onChange =
    inMass.onChange =
    inRadius.onChange =
    inSizeY.onChange =
    inSizeZ.onChange =
    inSizeX.onChange = () =>
    {
        removeBody();
    };

inActivate.onTriggered = () =>
{
    if (body)body.activate();
};

function removeBody()
{
    if (world && body) world.removeRigidBody(body);
    body = null;
}

inReset.onTriggered = () =>
{
    removeBody();
};

function updateBodyMeta()
{
    if (world)
        world.setBodyMeta(body,
            {
                "name": inName.get(),
                "mass": inMass.get(),
            });

    op.setUiAttribs({ "extendTitle": inName.get() });
}

function getTriangle(geom, i)
{
    const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (geom.verticesIndices && geom.verticesIndices.length)
    {
        const i3 = i * 3;
        const i13 = (i + 1) * 3;
        const i23 = (i + 2) * 3;
        arr[0] = geom.vertices[geom.verticesIndices[i3] * 3 + 0];
        arr[1] = geom.vertices[geom.verticesIndices[i3] * 3 + 1];
        arr[2] = geom.vertices[geom.verticesIndices[i3] * 3 + 2];

        arr[3] = geom.vertices[geom.verticesIndices[i13] * 3 + 0];
        arr[4] = geom.vertices[geom.verticesIndices[i13] * 3 + 1];
        arr[5] = geom.vertices[geom.verticesIndices[i13] * 3 + 2];

        arr[6] = geom.vertices[geom.verticesIndices[i23] * 3 + 0];
        arr[7] = geom.vertices[geom.verticesIndices[i23] * 3 + 1];
        arr[8] = geom.vertices[geom.verticesIndices[i23] * 3 + 2];
    }
    else
    {
        arr[0] = geom.vertices[i * 9 + 0];
        arr[1] = geom.vertices[i * 9 + 1];
        arr[2] = geom.vertices[i * 9 + 2];

        arr[3] = geom.vertices[i * 9 + 3];
        arr[4] = geom.vertices[i * 9 + 4];
        arr[5] = geom.vertices[i * 9 + 5];

        arr[6] = geom.vertices[i * 9 + 6];
        arr[7] = geom.vertices[i * 9 + 7];
        arr[8] = geom.vertices[i * 9 + 8];
    }

    return arr;
}

function setup()
{
    if (!inActive.get()) return;
    doScale = true;

    if (world)
        if (world && body) world.removeRigidBody(body);

    if (!tmpTrans)tmpTrans = new Ammo.btTransform();
    if (!transform)transform = new Ammo.btTransform();

    transform.setIdentity();

    copyCglTransform(transform);

    if (motionState)Ammo.destroy(motionState);
    if (colShape)Ammo.destroy(colShape);

    motionState = new Ammo.btDefaultMotionState(transform);

    if (inShape.get() == "Box") colShape = new Ammo.btBoxShape(new Ammo.btVector3(inSizeX.get() / 2, inSizeY.get() / 2, inSizeZ.get() / 2));
    if (inShape.get() == "Sphere") colShape = new Ammo.btSphereShape(inRadius.get());
    if (inShape.get() == "Cylinder") colShape = new Ammo.btCylinderShape(new Ammo.btVector3(inSizeX.get() / 2, inSizeY.get() / 2, inSizeZ.get() / 2));
    if (inShape.get() == "Capsule") colShape = new Ammo.btCapsuleShape(inRadius.get(), inSizeY.get());
    if (inShape.get() == "Cone") colShape = new Ammo.btConeShape(inRadius.get(), inSizeY.get());
    if (inShape.get() == "Geom Convex Hull")
    {
        if (!inGeom.isLinked())
        {
            op.setUiError("nogeom", "Shape needs geometry connected");
            return;
        }
        else op.setUiError("nogeom", null);

        colShape = new Ammo.btConvexHullShape();
        // const triangle_mesh = new Ammo.btTriangleMesh();

        const geom = inGeom.get();
        if (!geom) return;
        const _vec3_1 = new Ammo.btVector3(0, 0, 0);
        const _vec3_2 = new Ammo.btVector3(0, 0, 0);
        const _vec3_3 = new Ammo.btVector3(0, 0, 0);

        let step = 1;

        if (geom.getNumTriangles() > inGeomSimplify.get() && inGeomSimplify.get() > 0)
        {
            step = Math.floor(geom.getNumTriangles() / inGeomSimplify.get());
        }

        console.log("num t", step);
        for (let i = 0; i < geom.getNumTriangles(); i += step)
        {
            const triangle = getTriangle(geom, i);

            _vec3_1.setX(triangle[0]);
            _vec3_1.setY(triangle[1]);
            _vec3_1.setZ(triangle[2]);
            colShape.addPoint(_vec3_1, true);

            _vec3_2.setX(triangle[3]);
            _vec3_2.setY(triangle[4]);
            _vec3_2.setZ(triangle[5]);
            colShape.addPoint(_vec3_2, true);

            _vec3_3.setX(triangle[6]);
            _vec3_3.setY(triangle[7]);
            _vec3_3.setZ(triangle[8]);
            colShape.addPoint(_vec3_3, true);

            // triangle_mesh.addTriangle(
            //     _vec3_1,
            //     _vec3_2,
            //     _vec3_3,
            //     true
            // );
        }

        inRadius.set(1);
        inSizeX.set(1);
        inSizeY.set(1);
        inSizeZ.set(1);

        inRadius.setUiAttribs({ "greyout": true });
        inSizeX.setUiAttribs({ "greyout": true });
        inSizeY.setUiAttribs({ "greyout": true });
        inSizeZ.setUiAttribs({ "greyout": true });
        inGeomSimplify.setUiAttribs({ "greyout": false });
        doScale = false;
    }
    else
    {
        inGeomSimplify.setUiAttribs({ "greyout": true });
        inSizeX.setUiAttribs({ "greyout": inShape.get() == "Sphere" || inShape.get() == "Capsule" || inShape.get() == "Cone" });
        inSizeY.setUiAttribs({ "greyout": inShape.get() == "Sphere" });
        inSizeZ.setUiAttribs({ "greyout": inShape.get() == "Sphere" || inShape.get() == "Capsule" || inShape.get() == "Cone" });
        inRadius.setUiAttribs({ "greyout": inShape.get() == "Box" });
    }

    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(inMass.get(), localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(inMass.get(), motionState, colShape, localInertia);
    body = new Ammo.btRigidBody(rbInfo);
    world.addRigidBody(body);

    world.on("rayCastHit", (name) =>
    {
        outRayHit.set(name == inName.get());
    });

    updateBodyMeta();
    // updateDeactivation();
    console.log("body added...", body);
}

function renderTransformed()
{
    if (!body) return;
    if (!inActive.get()) return;

    let ms = body.getMotionState();
    if (ms)
    {
        ms.getWorldTransform(tmpTrans);
        let p = tmpTrans.getOrigin();
        let q = tmpTrans.getRotation();

        cgl.pushModelMatrix();

        mat4.identity(cgl.mMatrix);

        let scale = [inSizeX.get(), inSizeY.get(), inSizeZ.get()];

        if (inShape.get() == "Sphere") scale = [inRadius.get() * 2, inRadius.get() * 2, inRadius.get() * 2];
        if (inShape.get() == "Cone") scale = [inRadius.get() * 2, inSizeY.get(), inRadius.get() * 2];
        // if (inShape.get() == "Cylinder") scale = [inRadius.get() * 2, inSizeY.get(), inRadius.get() * 2];
        if (inShape.get() == "Capsule") scale = [inRadius.get() * 2, inSizeY.get() * 2, inRadius.get() * 2];

        mat4.fromRotationTranslationScale(transMat, [q.x(), q.y(), q.z(), q.w()], [p.x(), p.y(), p.z()], scale);
        mat4.mul(cgl.mMatrix, cgl.mMatrix, transMat);

        transformed.trigger();

        cgl.popModelMatrix();
    }
}

function copyCglTransform(transform)
{
    if (!btOrigin)
    {
        btOrigin = new Ammo.btVector3(0, 0, 0);
        btQuat = new Ammo.btQuaternion(0, 0, 0, 0);
    }
    mat4.getTranslation(tmpOrigin, cgl.mMatrix);
    mat4.getRotation(tmpQuat, cgl.mMatrix);

    let changed = false;

    btOrigin.setValue(tmpOrigin[0], tmpOrigin[1], tmpOrigin[2]);
    btQuat.setValue(tmpQuat[0], tmpQuat[1], tmpQuat[2], tmpQuat[3]);

    transform.setOrigin(btOrigin);
    transform.setRotation(btQuat);
}

function update()
{
    if (world != cgl.frameStore.ammoWorld) removeBody();

    world = cgl.frameStore.ammoWorld;
    if (!world) return;
    if (!body)setup(world);

    if (inNeverDeactivate.get()) body.activate(); // body.setActivationState(Ammo.DISABLE_DEACTIVATION); did not work.....

    if (inMass.get() == 0 || doResetPos)
    {
        copyCglTransform(transform);

        motionState.setWorldTransform(transform);
        body.setWorldTransform(transform);

        doResetPos = false;
    }

    renderTransformed();

    next.trigger();
}
