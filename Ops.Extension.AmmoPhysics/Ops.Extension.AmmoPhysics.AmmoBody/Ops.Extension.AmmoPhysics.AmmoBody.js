// https://github.com/enable3d/enable3d/blob/master/packages/ammoPhysics/src/three-to-ammo.js

const
    inExec = op.inTrigger("Update"),
    inName = op.inString("Name", ""),
    inMass = op.inFloat("Mass", 0),
    inFriction = op.inFloat("Friction", 0.5),
    inRollingFriction = op.inFloat("Rolling Friction", 0.5),
    inRestitution = op.inFloat("Restitution", 0.5),

    inShape = op.inDropDown("Shape", ["Box", "Sphere", "Cylinder", "Capsule", "Cone", "Geom Convex Hull", "Triangle Shape"], "Box"),
    inGeom = op.inObject("Geometry", null, "geometry"),
    inGeomSimplify = op.inInt("Simplify Max Triangles", 50),
    inRadius = op.inFloat("Radius", 0.5),
    inSizeX = op.inFloat("Size X", 1),
    inSizeY = op.inFloat("Size Y", 1),
    inSizeZ = op.inFloat("Size Z", 1),

    inPositions = op.inArray("Positions", null, 3),
    inPosIndex = op.inBool("Append Index to name", true),

    inNeverDeactivate = op.inBool("Never Deactivate"),
    inGhostObject = op.inBool("Ghost Object"),
    inActive = op.inBool("Active", true),
    inReset = op.inTriggerButton("Reset"),
    inActivate = op.inTriggerButton("Activate"),

    next = op.outTrigger("next"),
    outRayHit = op.outBoolNum("Ray Hit"),
    transformed = op.outTrigger("Transformed");

op.setPortGroup("Array", [inPositions, inPosIndex]);

inExec.onTriggered = update;

const cgl = op.patch.cgl;
let bodies = [];
let world = null;
let tmpTrans = null;

const tmpOrigin = vec3.create();
const tmpQuat = quat.create();
const tmpScale = vec3.create();
let transMat = mat4.create();

let btOrigin = null;
let btQuat = null;
let doResetPos = false;
let colShape = null;

let doScale = true;
let needsRemove = false;
inName.onChange = updateBodyMeta;

op.setPortGroup("Parameters", [inRestitution, inFriction, inRollingFriction, inMass]);
op.setPortGroup("Shape", [inShape, inGeom, inGeomSimplify, inRadius, inSizeY, inSizeX, inSizeZ]);
op.setPortGroup("Flags", [inNeverDeactivate, inActive, inGhostObject]);

inExec.onLinkChanged =
    inFriction.onChange =
    inRestitution.onChange =
    inRollingFriction.onChange =
    inGeomSimplify.onChange =
    inGhostObject.onChange =
    inGeom.onChange =
    inShape.onChange =
    inMass.onChange =
    inRadius.onChange =
    inSizeY.onChange =
    inSizeZ.onChange =
    inPositions.onChange =
    inSizeX.onChange = () =>
    {
        needsRemove = true;
    };

inPosIndex.onChange = updateBodyMeta;
op.onDelete = removeBody;

inActive.onChange = () =>
{
    if (!inActive.get()) removeBody();
};

inActivate.onTriggered = () =>
{
    for (let i = 0; i < bodies.length; i++)
        bodies[i].activate();
};

function removeBody()
{
    if (world)
    {
        for (let i = 0; i < bodies.length; i++)
            world.removeRigidBody(bodies[i]);
    }

    bodies.length = 0;
    doResetPos = true;
}

inReset.onTriggered = () =>
{
    needsRemove = true;
};

function updateBodyMeta()
{
    const n = inName.get();
    const appendIndex = inPosIndex.get();
    const posArr = inPositions.get();

    if (world)
        for (let i = 0; i < bodies.length; i++)
        {
            let name = n;
            if (appendIndex && posArr)name = n + "." + i;

            world.setBodyMeta(bodies[i],
                {
                    "name": name,
                    "mass": inMass.get(),
                });
        }

    op.setUiAttribs({ "extendTitle": inName.get() });
}

function setup()
{
    if (!inActive.get()) return;
    if (needsRemove) return;
    doScale = true;
    doResetPos = true;

    removeBody();

    if (!tmpTrans)tmpTrans = new Ammo.btTransform();
    // if (!transform)transform = new Ammo.btTransform();

    if (colShape)Ammo.destroy(colShape);
    colShape = null;
    // transform.setIdentity();
    // CABLES.AmmoWorld.copyCglTransform(cgl, transform);

    op.setUiError("nogeom", null);
    if (inShape.get() == "Box") colShape = new Ammo.btBoxShape(new Ammo.btVector3(inSizeX.get() / 2, inSizeY.get() / 2, inSizeZ.get() / 2));
    else if (inShape.get() == "Sphere") colShape = new Ammo.btSphereShape(inRadius.get());
    else if (inShape.get() == "Cylinder") colShape = new Ammo.btCylinderShape(new Ammo.btVector3(inSizeX.get() / 2, inSizeY.get() / 2, inSizeZ.get() / 2));
    else if (inShape.get() == "Capsule") colShape = new Ammo.btCapsuleShape(inRadius.get(), inSizeY.get());
    else if (inShape.get() == "Cone") colShape = new Ammo.btConeShape(inRadius.get(), inSizeY.get());
    else if (inShape.get() == "Triangle Shape")
    {
        const geom = inGeom.get();
        if (!geom || !inGeom.isLinked())
        {
            op.setUiError("nogeom", "Shape needs geometry connected");
            return;
        }
        else op.setUiError("nogeom", null);
        if (!geom) return;

        let mesh = new Ammo.btTriangleMesh(true, true);

        for (let i = 0; i < geom.verticesIndices.length / 3; i++)
        {
            mesh.addTriangle(
                new Ammo.btVector3(
                    geom.vertices[geom.verticesIndices[i * 3] * 3 + 0],
                    geom.vertices[geom.verticesIndices[i * 3] * 3 + 1],
                    geom.vertices[geom.verticesIndices[i * 3] * 3 + 2]
                ),
                new Ammo.btVector3(
                    geom.vertices[geom.verticesIndices[i * 3 + 1] * 3 + 0],
                    geom.vertices[geom.verticesIndices[i * 3 + 1] * 3 + 1],
                    geom.vertices[geom.verticesIndices[i * 3 + 1] * 3 + 2]
                ),
                new Ammo.btVector3(
                    geom.vertices[geom.verticesIndices[i * 3 + 2] * 3 + 0],
                    geom.vertices[geom.verticesIndices[i * 3 + 2] * 3 + 1],
                    geom.vertices[geom.verticesIndices[i * 3 + 2] * 3 + 2]
                ),
                false);
        }

        colShape = new Ammo.btBvhTriangleMeshShape(mesh, true, true);
    }
    else if (inShape.get() == "Geom Convex Hull")
    {
        const geom = inGeom.get();
        if (!geom || !inGeom.isLinked())
        {
            op.setUiError("nogeom", "Shape needs geometry connected");
            return;
        }
        else op.setUiError("nogeom", null);
        if (!geom) return;

        colShape = CABLES.AmmoWorld.createConvexHullFromGeom(geom, inGeomSimplify.get());

        doScale = false;
    }
    else
    {
        inGeomSimplify.setUiAttribs({ "greyout": true });
        op.log("unknown shape type", inShape.get());
        return;
    }

    if (inShape.get() == "Geom Convex Hull")
    {
        inRadius.setUiAttribs({ "greyout": true });
        inSizeX.setUiAttribs({ "greyout": true });
        inSizeY.setUiAttribs({ "greyout": true });
        inSizeZ.setUiAttribs({ "greyout": true });
        inGeomSimplify.setUiAttribs({ "greyout": false });
    }
    else
    {
        inSizeX.setUiAttribs({ "greyout": inShape.get() == "Sphere" || inShape.get() == "Capsule" || inShape.get() == "Cone" });
        inSizeY.setUiAttribs({ "greyout": inShape.get() == "Sphere" });
        inSizeZ.setUiAttribs({ "greyout": inShape.get() == "Sphere" || inShape.get() == "Capsule" || inShape.get() == "Cone" });
        inRadius.setUiAttribs({ "greyout": inShape.get() == "Box" });
    }

    colShape.setMargin(0.05);

    let mass = inMass.get();
    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let num = 1;
    let posArr = null;
    if (inPositions.isLinked())
    {
        num = 0;
        posArr = inPositions.get();

        if (posArr && posArr.length)
        {
            num = Math.max(num, posArr.length / 3);
        }
    }

    for (let i = 0; i < num; i++)
    {
        let transform = new Ammo.btTransform();

        const motionState = new Ammo.btDefaultMotionState(transform);

        let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);
        world.addRigidBody(body);

        // 		CF_STATIC_OBJECT= 1,
        // 		CF_KINEMATIC_OBJECT= 2,
        // 		CF_NO_CONTACT_RESPONSE = 4,
        // 		CF_CUSTOM_MATERIAL_CALLBACK = 8,//this allows per-triangle material (friction/restitution)
        // 		CF_CHARACTER_OBJECT = 16,
        // 		CF_DISABLE_VISUALIZE_OBJECT = 32, //disable debug drawing
        // 		CF_DISABLE_SPU_COLLISION_PROCESSING = 64//disable parallel/SPU processing
        if (inGhostObject.get())
            body.setCollisionFlags(body.getCollisionFlags() | 4);

        bodies.push(body);
        // body.activate();
        // motionStates.push(motionState);
    }
    setPositions();

    world.on("rayCastHit", (name) =>
    {
        outRayHit.set(name == inName.get());
    });

    updateParams();
    updateBodyMeta();

    // console.log("add ammobody",inName.get());
}

function setPositions()
{
    let posArr = inPositions.get();

    for (let i = 0; i < bodies.length; i++)
    {
        bodies[i].getMotionState().getWorldTransform(tmpTrans);

        if (posArr)
        {
            cgl.pushModelMatrix();
            mat4.translate(cgl.mMatrix, cgl.mMatrix, [
                posArr[i * 3 + 0], posArr[i * 3 + 1], posArr[i * 3 + 2]]);
        }
        CABLES.AmmoWorld.copyCglTransform(cgl, tmpTrans);
        if (posArr)cgl.popModelMatrix();

        bodies[i].getMotionState().setWorldTransform(tmpTrans);
        bodies[i].setWorldTransform(tmpTrans);
    }
}

function updateParams()
{
    if (!world || bodies.length == 0) return;
    for (let i = 0; i < bodies.length; i++)
    {
        bodies[i].setFriction(inFriction.get());
        bodies[i].setRollingFriction(inRollingFriction.get());
        bodies[i].setRestitution(inRestitution.get());
    }
}

function renderTransformed()
{
    if (!bodies.length) return;
    if (!inActive.get()) return;
    if (!tmpTrans) return;

    ping();

    if (transformed.isLinked())
        for (let i = 0; i < bodies.length; i++)
        {
            const body = bodies[i];
            let ms = body.getMotionState();
            if (ms)
            {
                ms.getWorldTransform(tmpTrans);

                if (!tmpTrans)console.log("no tmpTrans");
                let p = tmpTrans.getOrigin();
                let q = tmpTrans.getRotation();

                let scale = [inSizeX.get(), inSizeY.get(), inSizeZ.get()];

                if (inShape.get() == "Sphere") scale = [inRadius.get() * 2, inRadius.get() * 2, inRadius.get() * 2];
                if (inShape.get() == "Cone") scale = [inRadius.get() * 2, inSizeY.get(), inRadius.get() * 2];
                // if (inShape.get() == "Cylinder") scale = [inRadius.get() * 2, inSizeY.get(), inRadius.get() * 2];
                if (inShape.get() == "Capsule") scale = [inRadius.get() * 2, inSizeY.get() * 2, inRadius.get() * 2];

                if (isNaN(p.x()) || isNaN(q.x()))
                {
                    console.log("ammobody: rot/pos is nan... ", inName.get());
                    needsRemove = true;
                    // mat4.fromRotationTranslationScale(transMat, [0, 0, 0, 1], [1, 2, 3], scale);
                    // doResetPos=true;
                    // setPositions();
                    return;
                }
                else
                {
                    mat4.fromRotationTranslationScale(transMat, [q.x(), q.y(), q.z(), q.w()], [p.x(), p.y(), p.z()], scale);
                }

                cgl.pushModelMatrix();
                mat4.identity(cgl.mMatrix);

                mat4.mul(cgl.mMatrix, cgl.mMatrix, transMat);

                transformed.trigger();

                cgl.popModelMatrix();
            }
        }
}

function ping()
{
    if (world)
        for (let i = 0; i < bodies.length; i++)
            world.pingBody(bodies[i]);
}

function update()
{
    if (world && bodies.length && bodies[0] && world.getBodyMeta(bodies[0]) == undefined)removeBody();
    if (world != cgl.tempData.ammoWorld) removeBody();
    if (needsRemove)
    {
        removeBody();
        needsRemove = false;
    }

    world = cgl.tempData.ammoWorld;
    if (!world)
    {
        outRayHit.set(false);
        return;
    }
    if (!bodies.length) setup();
    if (!bodies.length) return;
    if (bodies[0] && inNeverDeactivate.get()) bodies[0].activate(); // body.setActivationState(Ammo.DISABLE_DEACTIVATION); did not work.....

    if (inMass.get() == 0 || doResetPos)
    {
        setPositions();
        doResetPos = false;
    }

    renderTransformed();

    next.trigger();
}
