const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", "default"),
    inCollShape = op.inDropDown("Body Shape", ["Cuboid", "Ball", "Cylinder", "Capsule", "Tri Mesh", "Convex Hull"], "Cuboid"),
    inType = op.inDropDown("Type", ["Dynamic", "Fixed", "KinematicPositionBased", "KinematicVelocityBased"], "Dynamic"),
    inGeom = op.inObject("Geometry", null, "geometry"),

    inMass = op.inFloat("Mass", 10),
    inFriction = op.inFloat("Friction", 1),
    inDensity = op.inFloat("Density", 1),
    inSensor = op.inBool("Sensor", false),

    inCollRadius = op.inFloat("Radius", 0.5),

    inCollSizeX = op.inFloat("Size X", 0.5),
    inCollSizeY = op.inFloat("Size Y", 0.5),
    inCollSizeZ = op.inFloat("Size Z", 0.5),

    inTranslX = op.inFloat("Translate X", 0.0),
    inTranslY = op.inFloat("Translate Y", 0.0),
    inTranslZ = op.inFloat("Translate Z", 0.0),

    inPositions = op.inArray("Positions"),
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

inMass.onChange =
    inSensor.onChange =
    inFriction.onChange =
    inDensity.onChange =
    inGeom.onChange =
    inName.onChange =
    inPositions.onChange =
    inType.onChange =
    inCollSizeX.onChange =
    inCollSizeY.onChange =
    inCollSizeZ.onChange =
    inCollShape.onChange =
    inCollRadius.onChange = () =>
    {
        op.setUiAttrib({ "extendTitle": inName.get() });
        needsSetup = true;
    };

inTranslX.onChange =
    inTranslY.onChange =
    inTranslZ.onChange = () =>
    {
        if (inType.get() == "KinematicPositionBased" || inType.get() == "Fixed")
        {
            setPosition = true;
        }
    };

exec.onTriggered = () =>
{
    const world = op.patch.frameStore.rapierWorld;
    if (!world) return;

    // if (!eventQueue)
    {
        eventQueue = op.patch.frameStore.rapierEventQueue;
        if (eventQueue)
        {
            // console.log("reg collision callback");
        }
        else console.log("no eventQueue");
    }

    if (world != lastWorld)needsSetup = true;
    if (rigidBodies.length == 0) needsSetup = true;
    if (needsSetup)setup(world);

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
        }

        outPos.setRef(posArray);
        outRot.setRef(rotArray);
        outSize.setRef(sizeArray);
    }

    next.trigger();
};

function getPositions()
{
    let pos = inPositions.get() || [0, 0, 0];

    for (let i = 0; i < pos.length; i += 3)
    {
        pos[i] += tmpOrigin[0];
        pos[i + 1] += tmpOrigin[1];
        pos[i + 2] += tmpOrigin[2];
    }

    return pos;
}

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

function setup(world)
{
    removeBodies();

    const pos = getPositions();
    let colliderDesc, collider;
    if (inCollShape.get() == "Capsule") colliderDesc = RAPIER.ColliderDesc.capsule(inCollSizeY.get(), inCollRadius.get());
    else if (inCollShape.get() == "Cylinder") colliderDesc = RAPIER.ColliderDesc.cylinder(inCollSizeY.get(), inCollRadius.get());
    else if (inCollShape.get() == "Cuboid") colliderDesc = RAPIER.ColliderDesc.cuboid(inCollSizeX.get(), inCollSizeY.get(), inCollSizeZ.get());
    else if (inCollShape.get() == "Ball") colliderDesc = RAPIER.ColliderDesc.ball(inCollRadius.get());
    else if (inCollShape.get() == "Tri Mesh")
    {
        const geom = inGeom.get();
        if (!geom || !geom.vertices || !geom.verticesIndices || geom.vertices.length == 0)
        {
            op.warn("no geom, or geom without faces, using cubes");
            colliderDesc = RAPIER.ColliderDesc.cuboid(0.02, 0.02, 0.02);
        }
        else
        {
            let faces = geom.verticesIndices || [];
            if (geom.verticesIndices.length == 0)
            {
                for (let i = 0; i < geom.vertices.length / 3; i++)
                    faces.push(i);
            }
            colliderDesc = RAPIER.ColliderDesc.trimesh(geom.vertices, faces);
        }
    }
    else if (inCollShape.get() == "Convex Hull")
    {
        const geom = inGeom.get();
        if (!geom || !geom.vertices || !geom.verticesIndices || geom.vertices.length == 0)
        {
            op.warn("no geom, or geom without faces, using cubes");
            colliderDesc = RAPIER.ColliderDesc.cuboid(0.02, 0.02, 0.02);
        }
        else
        {
            colliderDesc = RAPIER.ColliderDesc.convexHull(geom.vertices);
        }
    }
    else
    {
        op.warn("unknown shape");
        colliderDesc = RAPIER.ColliderDesc.cuboid(0.02, 0.02, 0.02);
    }

    for (let i = 0; i < pos.length; i += 3)
    {
        const rigidBodyDesc = RAPIER.RigidBodyDesc
            .dynamic()
            // .setAdditionalMass(0.5)
            .setTranslation(pos[i + 0], pos[i + 1], pos[i + 2]);

        colliderDesc
            .setMass(10)
            .setDensity(1)
            .setFriction(1)
            .setSensor(inSensor.get());
        // .setRotation({ w: 1.0, x: 0.0, y: 0.0, z: 0.0})
        // .setGravityScale(0.5)
        // .setCanSleep(true)
        // .setCcdEnabled(false);

        const rigidBody = world.createRigidBody(rigidBodyDesc);

        rigidBody.userData = { "name": inName.get() + "." + i };
        rigidBody.setBodyType(inType.indexPort.get());
        rigidBodies.push(rigidBody);

        collider = world.createCollider(colliderDesc, rigidBody);
        colliders.push(collider);

        colliderDesc.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
        collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
    }

    // console.log("colliders", colliders);
    outCollider.setRef(colliders);

    needsSetup = false;
    updateUi();
    lastWorld = world;
}

function removeBodies()
{
    if (lastWorld)
    {
        for (let i = 0; i < rigidBodies.length; i++)
        {
            lastWorld.removeRigidBody(rigidBodies[i]);
        }

        for (let i = 0; i < colliders.length; i++)
        {
            lastWorld.removeCollider(colliders[i]);
        }
        rigidBodies.length = 0;

        colliders.length = 0;
        eventQueue = null;
    }
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
