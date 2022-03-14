const
    inExec = op.inTrigger("Update"),
    inShape = op.inDropDown("Shape", ["Box", "Sphere"], "Box"),
    inSizeX = op.inFloat("Size X", 1),
    inSizeY = op.inFloat("Size Y", 1),
    inSizeZ = op.inFloat("Size Z", 1),
    inMass = op.inFloat("Mass", 0),
    inName = op.inString("Name", ""),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("next"),
    transformed = op.outTrigger("Transformed");

inExec.onTriggered = update;

const cgl = op.patch.cgl;
let body = null;
let world = null;
let tmpTrans = null;
let transform = null;
let motionState = null;
let tmpOrigin = vec3.create();
let doResetPos = false;

inName.onChange = updateBodyMeta;

inShape.onChange =
inMass.onChange =
inSizeY.onChange =
inSizeZ.onChange =
inSizeX.onChange = () =>
{
    removeBody();
};

function removeBody()
{
    if (world && body) world.removeRigidBody(body);
    body = null;
}

inReset.onTriggered = () =>
{
    // transform = new Ammo.btTransform();
    // transform.setIdentity();
    // doResetPos=true;
    removeBody();
};

function updateBodyMeta()
{
    if (world)
        world.setBodyMeta(body,
            {
                "name": inName.get()
            });
}

function setup()
{
    if (world && body) world.removeRigidBody(body);

    tmpTrans = new Ammo.btTransform();

    transform = new Ammo.btTransform();
    transform.setIdentity();
    // transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    // transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );

    copyCglTransform(transform);

    motionState = new Ammo.btDefaultMotionState(transform);

    let colShape;

    if (inShape.get() == "Box") colShape = new Ammo.btBoxShape(new Ammo.btVector3(inSizeX.get() / 2, inSizeY.get() / 2, inSizeZ.get() / 2));
    if (inShape.get() == "Sphere") colShape = new Ammo.btSphereShape(inSizeX.get());

    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(inMass.get(), localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(inMass.get(), motionState, colShape, localInertia);
    body = new Ammo.btRigidBody(rbInfo);
    world.addRigidBody(body);

    updateBodyMeta();

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
        // objThree.position.set( p.x(), p.y(), p.z() );
        // objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

        cgl.pushModelMatrix();

        mat4.identity(cgl.mMatrix);
        mat4.translate(cgl.mMatrix, cgl.mMatrix, [p.x(), p.y(), p.z()]);
        mat4.scale(cgl.mMatrix, cgl.mMatrix, [inSizeX.get(), inSizeY.get(), inSizeZ.get()]);

        transformed.trigger();

        cgl.popModelMatrix();
    }
}

function copyCglTransform(bgTransform)
{
    mat4.getTranslation(tmpOrigin, cgl.mMatrix);
    transform.setOrigin(new Ammo.btVector3(tmpOrigin[0], tmpOrigin[1], tmpOrigin[2]));
}

function update()
{
    if (world != cgl.frameStore.ammoWorld)
    {
        removeBody();
    }

    world = cgl.frameStore.ammoWorld;
    if (!world) return;
    if (!body)setup(world);

    // -----

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
