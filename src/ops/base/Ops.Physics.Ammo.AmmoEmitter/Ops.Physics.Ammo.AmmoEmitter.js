const
    inExec = op.inTrigger("Exec"),
    inNum = op.inInt("Maximum Number Bodies", 10),

    inRadius = op.inFloat("Radius", 1),
    inMass = op.inFloat("Mass", 1),

    inFriction = op.inFloat("Friction", 0.5),
    inRollingFriction = op.inFloat("Rolling Friction", 0.5),
    inRestitution = op.inFloat("Restitution", 0.5),

    inDirX = op.inFloat("Dir X"),
    inDirY = op.inFloat("Dir Y"),
    inDirZ = op.inFloat("Dir Z"),
    inSpeed = op.inFloat("Speed"),

    inSpawn = op.inTriggerButton("Spawn One"),
    inRemove = op.inTriggerButton("Remove All"),
    inActivate = op.inTriggerButton("Activate All"),
    inRemoveFalling = op.inBool("Remove Y<-100", true),
    // inLifeTime=op.inFloat("Lifetime",0),

    next = op.outTrigger("Next"),
    outPos = op.outArray("Positions", 3),
    outRot = op.outArray("Rotations Quats", 4);

let shouldspawnOne = false;
inSpawn.onTriggered = () => { shouldspawnOne = true; };

const bodies = [];
const cgl = op.patch.cgl;

let world = null;
let tmpTrans = null;
let btVelocity = null;

inRemove.onTriggered = removeAll;

inExec.onLinkChanged =
    op.onDelete = removeAll;

function removeAll()
{
    for (let i = 0; i < bodies.length; i++)
    {
        world.removeRigidBody(bodies[i].body);
    }

    outPos.set(null);
    outRot.set(null);

    bodies.length = 0;
}

inActivate.onTriggered = () =>
{
    for (let i = 0; i < bodies.length; i++) bodies[i].body.activate();
};

function setArrayTransformed(body, i, arrPos)
{
    if (!body) return;
    // if (!inActive.get()) return;
    // console.log(body)
    let ms = body.ms;
    if (ms)
    {
        ms.getWorldTransform(tmpTrans);
        let p = tmpTrans.getOrigin();
        let q = tmpTrans.getRotation();

        // cgl.pushModelMatrix();

        // mat4.identity(cgl.mMatrix);

        // let scale = [inSizeX.get(), inSizeY.get(), inSizeZ.get()];

        // if (inShape.get() == "Sphere") scale = [inRadius.get() * 2, inRadius.get() * 2, inRadius.get() * 2];
        // if (inShape.get() == "Cone") scale = [inRadius.get() * 2, inSizeY.get(), inRadius.get() * 2];
        // if (inShape.get() == "Cylinder") scale = [inRadius.get() * 2, inSizeY.get(), inRadius.get() * 2];
        // if (inShape.get() == "Capsule") scale = [inRadius.get() * 2, inSizeY.get() * 2, inRadius.get() * 2];

        arrPos[i * 3] = p.x();
        arrPos[i * 3 + 1] = p.y();
        arrPos[i * 3 + 2] = p.z();

        arrRot[i * 4] = q.x();
        arrRot[i * 4 + 1] = q.y();
        arrRot[i * 4 + 2] = q.z();
        arrRot[i * 4 + 3] = q.w();

        // mat4.fromRotationTranslationScale(transMat, [q.x(), q.y(), q.z(), q.w()], [p.x(), p.y(), p.z()], scale);
        // mat4.mul(cgl.mMatrix, cgl.mMatrix, transMat);

        // transformed.trigger();

        // cgl.popModelMatrix();
    }
}

function spawn()
{
    if (!world) return;
    if (!tmpTrans) tmpTrans = new Ammo.btTransform();

    let transform = null;
    let colShape = new Ammo.btSphereShape(inRadius.get());

    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(inMass.get(), localInertia);

    transform = new Ammo.btTransform();
    transform.setIdentity();

    CABLES.AmmoWorld.copyCglTransform(cgl, transform);

    let motionState = new Ammo.btDefaultMotionState(transform);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(inMass.get(), motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(inFriction.get());
    body.setRollingFriction(inRollingFriction.get());
    body.setRestitution(inRestitution.get());

    // console.log(bodies.length);

    let speed = inSpeed.get();
    let vx = inDirX.get() * speed;
    let vy = inDirY.get() * speed;
    let vz = inDirZ.get() * speed;

    if (!btVelocity) btVelocity = new Ammo.btVector3(0, 0, 0);

    btVelocity.setValue(vx, vy, vz);
    body.setLinearVelocity(btVelocity);

    world.addRigidBody(body);

    motionState.setWorldTransform(transform);
    body.setWorldTransform(transform);

    bodies.push({ "body": body, "ms": motionState });

    shouldspawnOne = false;
}

function dispose()
{
    for (let i = 0; i < bodies.length; i++)
    {
        world.removeRigidBody(bodies[i].body);
    }

    bodies.length = 0;
}

let arrPos = [];
let arrRot = [];

inExec.onTriggered = () =>
{
    if (shouldspawnOne) spawn();
    if (world != cgl.frameStore.ammoWorld)
    {
        world = cgl.frameStore.ammoWorld;
        world.on("dispose", dispose);
    }

    if (inRemoveFalling.get())
    {
        for (let i = 0; i < bodies.length; i++)
            if (bodies[i])
            {
                bodies[i].ms.getWorldTransform(tmpTrans);
                let p = tmpTrans.getOrigin();
                if (p.y() < -100)bodies.splice(i, 1);
            }
    }

    arrPos.length = bodies.length * 3;
    arrRot.length = bodies.length * 4;
    for (let i = 0; i < bodies.length; i++)
    {
        if (!bodies[i]) continue;
        // console.log(bodies[i].ms);
        setArrayTransformed(bodies[i], i, arrPos);
    }
    outPos.set(null);
    outPos.set(arrPos);
    outRot.set(null);
    outRot.set(arrRot);

    next.trigger();
};
