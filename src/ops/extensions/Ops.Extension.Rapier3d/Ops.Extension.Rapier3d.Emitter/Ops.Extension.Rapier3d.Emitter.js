const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", "emitter"),
    inCollShape = op.inDropDown("Body Shape", ["Cuboid", "Ball", "Cylinder"], "Cuboid"),
    inType = op.inDropDown("Type", ["Dynamic", "Fixed", "KinematicPositionBased", "KinematicVelocityBased"], "Dynamic"),

    inMass = op.inFloat("Mass", 10),
    inFriction = op.inFloat("Friction", 1),
    inDensity = op.inFloat("Density", 1),
    inSensor = op.inBool("Sensor", false),

    inCollRadius = op.inFloat("Radius", 0.5),

    inCollSizeX = op.inFloat("Size X", 0.5),
    inCollSizeY = op.inFloat("Size Y", 0.5),
    inCollSizeZ = op.inFloat("Size Z", 0.5),

    inTranslX = op.inFloat("Spawn X", 0.0),
    inTranslY = op.inFloat("Spawn Y", 0.0),
    inTranslZ = op.inFloat("Spawn Z", 0.0),
    inLifetime = op.inFloat("Lifetime", 0),

    inEmit = op.inTriggerButton("Emit"),
    inClear = op.inTriggerButton("Remove"),

    next = op.outTrigger("Next"),
    outSleeping = op.outBoolNum("Sleeping"),
    outPos = op.outArray("Result Positions", [], 3),
    outSize = op.outArray("Result Size", [], 3),
    outRot = op.outArray("Result Rotations", [], 4),
    outCollider = op.outArray("Collider");

let needsSetup, lastWorld, oldShape;
let rigidBodies = [];
let colliders = [];
let tmpOrigin = vec3.create();

exec.onLinkChanged = removeBodies;
let setPosition = false;
let eventQueue = null;
let count = 0;

inMass.onChange =
    inSensor.onChange =
    inFriction.onChange =
    inDensity.onChange =
    inName.onChange =
    inType.onChange =
    inCollSizeX.onChange =
    inCollSizeY.onChange =
    inCollSizeZ.onChange =
    inCollShape.onChange =
    inCollRadius.onChange = () =>
    {
        op.setUiAttrib({ "extendTitle": inName.get() });
    };

inClear.onTriggered = removeBodies;
inEmit.onTriggered = emitOne;

inTranslX.onChange =
    inTranslY.onChange =
    inTranslZ.onChange = () =>
    {
        if (inType.get() == "KinematicPositionBased" || inType.get() == "Fixed")
        {
            setPosition = true;
        }
    };

exec.onLinkChanged = removeBodies;

exec.onTriggered = () =>
{
    if (!exec.isLinked()) return;
    const world = op.patch.frameStore.rapierWorld;

    if (!world) return;
    if (world != lastWorld)removeBodies();
    // if (!eventQueue)
    {
        eventQueue = op.patch.frameStore.rapierEventQueue;
        if (eventQueue)
        {
            // console.log("reg collision callback");
        }
        else console.log("no eventQueue");
    }

    lastWorld = world;

    // if (world != lastWorld)needsSetup = true;
    // if (rigidBodies.length == 0) needsSetup = true;
    // if (needsSetup)setup(world);

    const posArray = [];
    const rotArray = [];
    const sizeArray = [];

    let sleepCount = 0;
    for (let i = 0; i < rigidBodies.length; i++)
        if (rigidBodies[i].isSleeping()) sleepCount++;

    outSleeping.set(sleepCount != rigidBodies.length);
    mat4.getTranslation(tmpOrigin, op.patch.cg.mMatrix);

    if (setPosition == true)
    {
        for (let i = 0; i < rigidBodies.length; i++)
        {
            rigidBodies[i].setTranslation({ "x": inTranslX.get(), "y": inTranslY.get(), "z": inTranslZ.get() }, true);

            setPosition = false;
        }
    }

    if (sleepCount != rigidBodies.length)
    {
        for (let i = 0; i < rigidBodies.length; i++)
        {
            const pos = rigidBodies[i].translation();
            const rot = rigidBodies[i].rotation();

            posArray.push(pos.x, pos.y, pos.z);

            rotArray.push(rot.x, rot.y, rot.z, rot.w);

            if (inCollShape.get() == "Ball") sizeArray.push(inCollRadius.get(), inCollRadius.get(), inCollRadius.get());
            else sizeArray.push(inCollSizeX.get() * 2, inCollSizeY.get() * 2, inCollSizeZ.get() * 2);

            if (rigidBodies[i].userData.death && rigidBodies[i].userData.death < performance.now())
            {
                removeBody(i);
            }
        }

        outPos.setRef(posArray);
        outRot.setRef(rotArray);
        outSize.setRef(sizeArray);
    }

    next.trigger();
};

function updateUi()
{
    if (!CABLES.UI) return;
    if (oldShape == inCollShape.get()) return;
    oldShape = inCollShape.get();

    inCollRadius.setUiAttribs({ "greyout": false });
    inCollSizeX.setUiAttribs({ "greyout": false });
    inCollSizeY.setUiAttribs({ "greyout": false });
    inCollSizeZ.setUiAttribs({ "greyout": false });

    if (inCollShape.get() == "Capsule" || inCollShape.get() == "Cylinder")
    {
        inCollSizeZ.setUiAttribs({ "greyout": true });
        inCollSizeX.setUiAttribs({ "greyout": true });
    }
    if (inCollShape.get() == "Cuboid")
    {
        inCollRadius.setUiAttribs({ "greyout": true });
    }
    if (inCollShape.get() == "Ball")
    {
        inCollSizeX.setUiAttribs({ "greyout": true });
        inCollSizeY.setUiAttribs({ "greyout": true });
        inCollSizeZ.setUiAttribs({ "greyout": true });
    }
}

function emitOne()
{
    if (!exec.isLinked()) return;

    const world = lastWorld;
    if (!world) return;

    let colliderDesc, collider;
    if (inCollShape.get() == "Capsule") colliderDesc = RAPIER.ColliderDesc.capsule(inCollSizeY.get(), inCollRadius.get());
    else if (inCollShape.get() == "Cylinder") colliderDesc = RAPIER.ColliderDesc.cylinder(inCollSizeY.get(), inCollRadius.get());
    else if (inCollShape.get() == "Cuboid") colliderDesc = RAPIER.ColliderDesc.cuboid(inCollSizeX.get(), inCollSizeY.get(), inCollSizeZ.get());
    else if (inCollShape.get() == "Ball") colliderDesc = RAPIER.ColliderDesc.ball(inCollRadius.get());
    else
    {
        op.warn("unknown shape");
        colliderDesc = RAPIER.ColliderDesc.cuboid(0.02, 0.02, 0.02);
    }

    const rigidBodyDesc = RAPIER.RigidBodyDesc
        .dynamic()
    // .setAdditionalMass(0.5)
        .setTranslation(inTranslX.get(), inTranslY.get(), inTranslZ.get());

    colliderDesc
        .setMass(10)
        .setDensity(1)
        .setFriction(1)
        .setSensor(inSensor.get());

    const rigidBody = world.createRigidBody(rigidBodyDesc);

    rigidBody.userData = { "name": inName.get() + "." + count++ };
    if (inLifetime.get() > 0)
    {
        rigidBody.userData.death = performance.now() + inLifetime.get() * 1000;
    }
    rigidBody.setBodyType(inType.indexPort.get());
    rigidBodies.push(rigidBody);

    collider = world.createCollider(colliderDesc, rigidBody);
    colliders.push(collider);

    colliderDesc.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
    collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
    outCollider.setRef(colliders);
}

function removeBody(i)
{
    lastWorld.removeRigidBody(rigidBodies[i]);
    lastWorld.removeCollider(colliders[i]);
    rigidBodies.splice(i, 1);
    colliders.splice(i, 1);
}

function removeBodies()
{
    if (lastWorld)
    {
        while (rigidBodies.length)
            removeBody(0);

        rigidBodies.length = 0;

        colliders.length = 0;
        eventQueue = null;
    }

    outPos.setRef([]);
    outRot.setRef([]);
    outSize.setRef([]);
}

op.onDelete = () =>
{
    removeBodies();
};

op.on("onEnabledChange", () =>
{
    removeBodies();
});

/// ////////
