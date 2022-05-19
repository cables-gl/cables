// https://github.com/enable3d/enable3d/blob/master/packages/ammoPhysics/src/three-to-ammo.js

const
    inExec = op.inTrigger("Update"),
    inName = op.inString("Name", ""),
    inMass = op.inFloat("Mass", 0),
    inFriction = op.inFloat("Friction", 0.5),
    inRollingFriction = op.inFloat("Rolling Friction", 0.5),
    inRestitution = op.inFloat("Restitution", 0.5),

    inShape = op.inDropDown("Shape", ["Box", "Sphere", "Cylinder", "Capsule", "Cone", "Geom Convex Hull"], "Box"),
    inGeom = op.inObject("Geometry", null, "geometry"),
    inGeomSimplify = op.inInt("Simplify Max Triangles", 50),
    inRadius = op.inFloat("Radius", 1),
    inSizeX = op.inFloat("Size X", 1),
    inSizeY = op.inFloat("Size Y", 1),
    inSizeZ = op.inFloat("Size Z", 1),
    inNeverDeactivate = op.inBool("Never Deactivate"),
    inGhostObject = op.inBool("Ghost Object"),
    inActive = op.inBool("Active", true),
    inReset = op.inTriggerButton("Reset"),
    inActivate = op.inTriggerButton("Activate"),

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

op.setPortGroup("Parameters", [inRestitution, inFriction, inRollingFriction, inMass]);
op.setPortGroup("Shape", [inShape, inGeom, inGeomSimplify, inRadius, inSizeY, inSizeX, inSizeZ]);
op.setPortGroup("Flags", [inNeverDeactivate, inActive, inGhostObject]);

inExec.onLinkChanged =
    inFriction.onChange =
    inRestitution.onChange =
    inRollingFriction.onChange =
    op.onDelete =
    inGeomSimplify.onChange =
    inGhostObject.onChange =
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
    if (world && body)
    {
        world.removeRigidBody(body);
        // Ammo.destroy(body);
    }

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

function setup()
{
    if (!inActive.get()) return;
    doScale = true;

    if (world)
        if (world && body) world.removeRigidBody(body);

    if (!tmpTrans)tmpTrans = new Ammo.btTransform();
    if (!transform)transform = new Ammo.btTransform();
    if (colShape)Ammo.destroy(colShape);

    transform.setIdentity();

    CABLES.AmmoWorld.copyCglTransform(cgl, transform);

    if (motionState)Ammo.destroy(motionState);
    motionState = new Ammo.btDefaultMotionState(transform);

    if (inShape.get() == "Box") colShape = new Ammo.btBoxShape(new Ammo.btVector3(inSizeX.get() / 2, inSizeY.get() / 2, inSizeZ.get() / 2));
    else if (inShape.get() == "Sphere") colShape = new Ammo.btSphereShape(inRadius.get());
    else if (inShape.get() == "Cylinder") colShape = new Ammo.btCylinderShape(new Ammo.btVector3(inSizeX.get() / 2, inSizeY.get() / 2, inSizeZ.get() / 2));
    else if (inShape.get() == "Capsule") colShape = new Ammo.btCapsuleShape(inRadius.get(), inSizeY.get());
    else if (inShape.get() == "Cone") colShape = new Ammo.btConeShape(inRadius.get(), inSizeY.get());
    else if (inShape.get() == "Geom Convex Hull")
    {
        if (!inGeom.isLinked())
        {
            op.setUiError("nogeom", "Shape needs geometry connected");
            return;
        }
        else op.setUiError("nogeom", null);

        const geom = inGeom.get();
        if (!geom) return;

        colShape = CABLES.AmmoWorld.createConvexHullFromGeom(geom, inGeomSimplify.get());

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
        console.log("unknown shape type", inShape.get());
        return;
    }

    inGeomSimplify.setUiAttribs({ "greyout": true });
    inSizeX.setUiAttribs({ "greyout": inShape.get() == "Sphere" || inShape.get() == "Capsule" || inShape.get() == "Cone" });
    inSizeY.setUiAttribs({ "greyout": inShape.get() == "Sphere" });
    inSizeZ.setUiAttribs({ "greyout": inShape.get() == "Sphere" || inShape.get() == "Capsule" || inShape.get() == "Cone" });
    inRadius.setUiAttribs({ "greyout": inShape.get() == "Box" });

    colShape.setMargin(0.05);

    let mass = inMass.get();
    // if (inGhostObject.get())mass=0;

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    body = new Ammo.btRigidBody(rbInfo);
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

    world.on("rayCastHit", (name) =>
    {
        outRayHit.set(name == inName.get());
    });

    updateParams();
    updateBodyMeta();
}

function updateParams()
{
    if (!body) return;
    body.setFriction(inFriction.get());
    body.setRollingFriction(inRollingFriction.get());
    body.setRestitution(inRestitution.get());
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

function update()
{
    if (world != cgl.frameStore.ammoWorld) removeBody();

    world = cgl.frameStore.ammoWorld;
    if (!world)
    {
        outRayHit.set(false);
        return;
    }
    if (!body)setup(world);
    if (!body) return;
    if (inNeverDeactivate.get()) body.activate(); // body.setActivationState(Ammo.DISABLE_DEACTIVATION); did not work.....

    if (inMass.get() == 0 || doResetPos)
    {
        CABLES.AmmoWorld.copyCglTransform(cgl, transform);

        motionState.setWorldTransform(transform);
        body.setWorldTransform(transform);

        doResetPos = false;
    }

    renderTransformed();

    next.trigger();
}
