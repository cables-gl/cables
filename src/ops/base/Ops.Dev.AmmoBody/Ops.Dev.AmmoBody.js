const
    inExec = op.inTrigger("Update"),
    inShape = op.inDropDown("Shape", ["Box", "Sphere", "Cylinder", "Capsule", "Cone"], "Box"),
    inRadius = op.inFloat("Radius", 1),
    inSizeX = op.inFloat("Size X", 1),
    inSizeY = op.inFloat("Size Y", 1),
    inSizeZ = op.inFloat("Size Z", 1),
    inMass = op.inFloat("Mass", 0),
    inName = op.inString("Name", ""),
    inReset = op.inTriggerButton("Reset"),
    inActivate = op.inTriggerButton("Activate"),
    inNeverDeactivate = op.inBool("Never Deactivate"),
    next = op.outTrigger("next"),
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

inName.onChange = updateBodyMeta;

op.onDelete =
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

function setup()
{
    if (world && body) world.removeRigidBody(body);

    tmpTrans = new Ammo.btTransform();
    transform = new Ammo.btTransform();

    transform.setIdentity();

    copyCglTransform(transform);

    motionState = new Ammo.btDefaultMotionState(transform);

    let colShape;

    if (inShape.get() == "Box") colShape = new Ammo.btBoxShape(new Ammo.btVector3(inSizeX.get() / 2, inSizeY.get() / 2, inSizeZ.get() / 2));
    if (inShape.get() == "Sphere") colShape = new Ammo.btSphereShape(inRadius.get());
    if (inShape.get() == "Cylinder") colShape = new Ammo.btCylinderShape(new Ammo.btVector3(inSizeX.get() / 2, inSizeY.get() / 2, inSizeZ.get() / 2));
    if (inShape.get() == "Capsule") colShape = new Ammo.btCapsuleShape(inRadius.get(), inSizeY.get());
    if (inShape.get() == "Cone") colShape = new Ammo.btConeShape(inRadius.get(), inSizeY.get());

    inSizeX.setUiAttribs({ "greyout": inShape.get() == "Sphere" || inShape.get() == "Cylinder" || inShape.get() == "Capsule" || inShape.get() == "Cone" });
    inSizeY.setUiAttribs({ "greyout": inShape.get() == "Sphere" });
    inSizeZ.setUiAttribs({ "greyout": inShape.get() == "Sphere" || inShape.get() == "Cylinder" || inShape.get() == "Capsule" || inShape.get() == "Cone" });
    inRadius.setUiAttribs({ "greyout": inShape.get() == "Box" });

    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(inMass.get(), localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(inMass.get(), motionState, colShape, localInertia);
    body = new Ammo.btRigidBody(rbInfo);
    world.addRigidBody(body);

    updateBodyMeta();
    // updateDeactivation();
    console.log("body added...", body);
}

function renderTransformed()
{
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
