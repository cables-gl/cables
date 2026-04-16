// nsnsns
const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", "default"),
    inCollShape = op.inDropDown("Body Shape", ["Cuboid", "Ball", "Cylinder", "Capsule", "Tri Mesh", "Convex Hull"], "Cuboid"),
    inType = op.inDropDown("Type", ["Dynamic", "Fixed", "KinematicPositionBased", "KinematicVelocityBased"], "Dynamic"),
    inGeom = op.inObject("Geometry", null, "geometry"),

    inMass = op.inFloat("Mass", 10),
    inFriction = op.inFloat("Friction", 1),
    inDensity = op.inFloat("Density", 1),
    inRestitution = op.inFloat("Restitution", 0.3),

    inDampLin = op.inFloat("Linear Damping", 1),
    inDampAng = op.inFloat("Angular Damping", 1),

    inSensor = op.inBool("Sensor", false),
    inTrans = op.inBool("Transform", true),

    inCollRadius = op.inFloat("Radius", 0.5),

    inCollSizeX = op.inFloat("Size X", 0.5),
    inCollSizeY = op.inFloat("Size Y", 0.5),
    inCollSizeZ = op.inFloat("Size Z", 0.5),

    inTranslX = op.inFloat("Translate X", 0.0),
    inTranslY = op.inFloat("Translate Y", 0.0),
    inTranslZ = op.inFloat("Translate Z", 0.0),

    inPositions = op.inArray("Positions"),
    inScales = op.inArray("Scalings"),
    inRots = op.inArray("Rotations"),

    inEvents = op.inBool("Events", true),
    inActive = op.inBool("Active", true),
    inUpdateTrans = op.inTriggerButton("Update Translation"),

    next = op.outTrigger("Next"),
    outSleeping = op.outBoolNum("Sleeping"),
    outPos = op.outArray("Result Positions", [], 3),
    outSize = op.outArray("Result Size", [], 3),
    outRot = op.outArray("Result Rotations", [], 4),
    outCollider = op.outArray("Collider"),
    outBodies = op.outArray("Bodies");

let needsSetup, lastWorld, oldShape;
let rigidBodies = [];
let colliders = [];
let tmpOrigin = vec3.create();
let needsUpdateTrans = true;

exec.onLinkChanged = removeBodies;
let setPosition = false;
let eventQueue = null;

inScales.onChange =
inRots.onChange =
inDampLin.onChange =
inDampAng.onChange =
inEvents.onChange =
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
        let title = "";
        title += inType.get() + " ";
        if (inSensor.get())title += "sensor ";
        title += inName.get();
        op.setUiAttrib({ "extendTitle": title });
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
        else
        {
            needsSetup = true;
        }
    };

inActive.onChange = () =>
{
    if (!inActive.get()) removeBodies();
    needsSetup = true;
};

exec.onTriggered = () =>
{
    const world = op.patch.frameStore.rapier?.world;
    if (!world) return;
    if (!inActive.get()) return;

    eventQueue = op.patch.frameStore.rapier.eventQueue;
    if (eventQueue)
    {
        // console.log("reg collision callback");
    }
    else console.log("no eventQueue");

    if (world != lastWorld)
    {
        needsSetup = true;
        removeBodies();
    }
    if (rigidBodies.length == 0) needsSetup = true;
    if (needsSetup)setup(world);

    const posArray = [];
    const rotArray = [];
    const sizeArray = [];

    let sleepCount = 0;
    for (let i = 0; i < rigidBodies.length; i++)
        if (rigidBodies[i].isSleeping()) sleepCount++;

    outSleeping.set(sleepCount != rigidBodies.length);
    // mat4.getTranslation(tmpOrigin, op.patch.cg.mMatrix);

    if (setPosition)
    {
        const posArr = getPositions();// inPositions.get();
        for (let i = 0; i < rigidBodies.length; i++)
        {
            rigidBodies[i].setTranslation({ "x": posArr[i * 3 + 0], "y": posArr[i * 3 + 1], "z": posArr[i * 3 + 2] }, true);
            rigidBodies[i].setRotation({ "x": posArr[i * 3 + 0], "y": posArr[i * 3 + 1], "z": posArr[i * 3 + 2] }, true);

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

    if (!inEvents.get())
        for (let i = 0; i < rigidBodies.length; i++)
            op.patch.frameStore.rapier.ignoreEventHandles.push(rigidBodies[i].handle);

    next.trigger();
};

function getRotations()
{
    const roti = quat.create();
    let rot = inRots.get() || [0, 0, 0, 0];

    if (inTrans.get())
    {
        mat4.getRotation(roti, op.patch.cgl.mMatrix);
    }

    for (let i = 0; i < rot.length; i += 4)
    {
        rot[i + 0] = roti[0];
        rot[i + 1] = roti[1];
        rot[i + 2] = roti[2];
        rot[i + 3] = roti[3];
    }

    return rot;
}

function getPositions()
{
    const translati = vec3.create();
    const scale = vec3.create();
    let pos = inPositions.get() || [0, 0, 0];

    if (inTrans.get())
    {
        mat4.getScaling(scale, op.patch.cgl.mMatrix);
        mat4.getTranslation(translati, op.patch.cgl.mMatrix);
    }

    for (let i = 0; i < pos.length; i += 3)
    {
        pos[i] += translati[0] + inTranslX.get();
        pos[i + 1] += translati[1] + inTranslY.get();
        pos[i + 2] += translati[2] + inTranslZ.get();
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
    if (inCollShape.get() != "Ball")
    {
        inCollRadius.setUiAttribs({ "greyout": true });
    }
    if (inCollShape.get() != "Cuboid")
    {
        inCollSizeX.setUiAttribs({ "greyout": true });
        inCollSizeY.setUiAttribs({ "greyout": true });
        inCollSizeZ.setUiAttribs({ "greyout": true });
    }

    if (inCollShape.get() != "Dynamic")
    {
        inFriction.setUiAttribs({ "greyout": true });
        inDensity.setUiAttribs({ "greyout": true });
        inRestitution.setUiAttribs({ "greyout": true });
        inMass.setUiAttribs({ "greyout": true });
        inDampLin.setUiAttribs({ "greyout": true });
        inDampAng.setUiAttribs({ "greyout": true });
    }
}

function setup(world)
{
    removeBodies();

    const pos = getPositions();
    const rot = getRotations();
    const scal = inScales.get();
    let colliderDesc, collider;
    if (inCollShape.get() == "Capsule") colliderDesc = RAPIER.ColliderDesc.capsule(inCollSizeY.get(), inCollRadius.get());
    else if (inCollShape.get() == "Cylinder") colliderDesc = RAPIER.ColliderDesc.cylinder(inCollSizeY.get(), inCollRadius.get());
    else if (inCollShape.get() == "Cuboid") colliderDesc = RAPIER.ColliderDesc.cuboid(inCollSizeX.get(), inCollSizeY.get(), inCollSizeZ.get());
    else if (inCollShape.get() == "Ball") colliderDesc = RAPIER.ColliderDesc.ball(inCollRadius.get());
    else if (inCollShape.get() == "Tri Mesh")
    {
        let geom = inGeom.get();
        if (!geom || !geom.vertices || !geom.verticesIndices || geom.vertices.length == 0)
        {
            op.warn("no geom, or geom without faces, using cubes");
            colliderDesc = RAPIER.ColliderDesc.cuboid(0.02, 0.02, 0.02);
        }
        else
        {
            geom = geom.copy();
            let faces = geom.verticesIndices || [];
            if (geom.verticesIndices.length == 0)
            {
                for (let i = 0; i < geom.vertices.length / 3; i++)
                    faces.push(i);
            }

            const scale = vec3.create();
            mat4.getScaling(scale, op.patch.cgl.mMatrix);
            geom.scale(scale[0], scale[1], scale[2]);

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
            // .setAdditionalMass(1)
            .setLinearDamping(inDampLin.get())
            .setAngularDamping(inDampAng.get())

            .setTranslation(pos[i + 0], pos[i + 1], pos[i + 2]);

        if (rot && rot.length > i / 3 * 4)
        {
            rigidBodyDesc.setRotation(
                {
                    "x": rot[(i / 3) * 4 + 0],
                    "y": rot[(i / 3) * 4 + 1],
                    "z": rot[(i / 3) * 4 + 2],
                    "w": rot[(i / 3) * 4 + 3]

                }, true);
        }

        if (scal && scal.length >= i)
        {
            colliderDesc = RAPIER.ColliderDesc.cuboid(
                scal[i + 0] / 2,
                scal[i + 1] / 2,
                scal[i + 2] / 2);
        }

        colliderDesc
            .setMass(inMass.get())
            .setRestitution(inRestitution.get())
            .setDensity(inDensity.get())
            .setFriction(inFriction.get())
            .setSensor(inSensor.get());

        // if (!inEvents.get())
        // colliderDesc.setActiveEvents(RAPIER.ActiveEvents.NONE);

        const rigidBody = world.createRigidBody(rigidBodyDesc);

        rigidBody.userData = { "name": inName.get() + "." + i };
        rigidBody.setBodyType(inType.indexPort.get());
        rigidBodies.push(rigidBody);

        collider = world.createCollider(colliderDesc, rigidBody);
        colliders.push(collider);

        // if (!inEvents.get())
        // {
        //     collider.setActiveEvents(RAPIER.ActiveEvents.NONE);
        // }
        // else
        {
            collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
            // colliderDesc.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
        }
    }

    // console.log("colliders", colliders);
    outCollider.setRef(colliders);
    outBodies.setRef(rigidBodies);

    needsSetup = false;
    setPosition = true;
    updateUi();
    lastWorld = world;
}

inUpdateTrans.onTriggered = () =>
{
    setPosition = true;
};

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

        outCollider.setRef([]);
        outBodies.setRef([]);
        outPos.setRef([]);
        outRot.setRef([]);
        outSize.setRef([]);
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
