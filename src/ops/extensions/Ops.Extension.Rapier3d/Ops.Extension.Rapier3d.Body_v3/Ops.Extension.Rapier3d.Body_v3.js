const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", "default"),
    inCollShape = op.inDropDown("Body Shape", ["Cuboid", "Ball", "Cylinder", "Capsule", "Tri Mesh", "Convex Hull"], "Cuboid"),
    inType = op.inDropDown("Type", ["Dynamic", "Fixed", "KinematicPositionBased", "KinematicVelocityBased"], "Dynamic"),
    inRender = op.inBool("Render", false),

    inTranslX = op.inFloat("Translate X", 0.0),
    inTranslY = op.inFloat("Translate Y", 0.0),
    inTranslZ = op.inFloat("Translate Z", 0.0),
    inTrans = op.inBool("Transform", true),

    inCollRadius = op.inFloat("Radius", 0.5),
    inCollSizeX = op.inFloat("Size X", 0.5),
    inCollSizeY = op.inFloat("Size Y", 0.5),
    inCollSizeZ = op.inFloat("Size Z", 0.5),
    inGeom = op.inObject("Geometry", null, "geometry"),

    inMass = op.inFloat("Mass", 10),
    inFriction = op.inFloat("Friction", 1),
    inDensity = op.inFloat("Density", 1),
    inRestitution = op.inFloat("Restitution", 0.3),
    inDampLin = op.inFloat("Linear Damping", 1),
    inDampAng = op.inFloat("Angular Damping", 1),
    inSensor = op.inBool("Sensor", false),

    inPositions = op.inArray("Positions"),
    inScales = op.inArray("Scalings"),
    inRots = op.inArray("Rotations"),

    inEvents = op.inBool("Events", true),
    inEvtFixFix = op.inBool("Events Fixed-Fixed", false),

    inActive = op.inBool("Active", true),
    inUpdateTrans = op.inTriggerButton("Update Translation"),
    inWakeup = op.inTriggerButton("Force Wakeup"),

    next = op.outTrigger("Next"),
    outSleeping = op.outBoolNum("Sleeping"),
    outPos = op.outArray("Result Positions", [], 3),
    outSize = op.outArray("Result Size", [], 3),
    outRot = op.outArray("Result Rotations", [], 4),
    outCollider = op.outArray("Collider"),
    outBodies = op.outArray("Bodies");

op.setPortGroup("Translate", [inTranslX, inTranslY, inTranslZ, inTrans]);
op.setPortGroup("Size", [inCollRadius, inCollSizeX, inCollSizeY, inCollSizeZ, inGeom]);
op.setPortGroup("Properties", [inMass, inFriction, inDensity, inRestitution, inDampLin, inDampAng, inSensor]);
op.setPortGroup("Instances", [inPositions, inScales, inRots]);
op.setPortGroup("Collision Events", [inEvents, inEvtFixFix]);
op.setPortGroup("Simulation", [inActive, inUpdateTrans, inWakeup]);

const cgl = op.patch.cgl;
const SPHERE_RINGS = 16;
const SPHERE_SEGMENTS = 24;
const CYLINDER_SEGMENTS = 24;

let needsSetup, lastWorld, oldShape;
let rigidBodies = [];
let colliders = [];
let tmpOrigin = vec3.create();
let glScale = vec3.create();
let setupReason = "";
let setPosition = false;
let eventQueue = null;

const shapeSize = vec3.create();
const renderScale = vec3.create();
const renderPos = vec3.create();
const renderRot = quat.create();
const shapeMeshes = {};
let capsuleRadius = 0;
let capsuleHalfHeight = 0;

exec.onLinkChanged = removeBodies;
inRender.onChange = updateUi;

inPositions.onChange =
    inScales.onChange =
    inRots.onChange = () =>
    {
        setPosition = true;
    };

inPositions.onLinkChanged =
    inScales.onLinkChanged =
    inRots.onLinkChanged =

    inEvtFixFix.onChange =
    inDampLin.onChange =
    inDampAng.onChange =
    inEvents.onChange =
    inMass.onChange =
    inRestitution.onChange =
    inSensor.onChange =
    inFriction.onChange =
    inDensity.onChange =
    inGeom.onChange =
    inName.onChange =
    inType.onChange =
    inCollSizeX.onChange =
    inCollSizeY.onChange =
    inCollSizeZ.onChange =
    inCollShape.onChange =
    inCollRadius.onChange = () =>
    {
        setupReason = "paramschanged";
        let title = "";
        title += inType.get() + " " + inCollShape.get() + " ";
        if (inSensor.get()) title += "sensor ";
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
            setupReason = "non fixed body translation change";
            needsSetup = true;
        }
    };

inActive.onChange = () =>
{
    if (!inActive.get()) removeBodies();
    setPosition = true;
    needsSetup = true;
    setupReason = "active toggled";
};

function float32Diff(a, b)
{
    return Math.abs(a - b) > 0.0001;
}

inWakeup.onTriggered = () =>
{
    for (let i = 0; i < rigidBodies.length; i++) rigidBodies[i].wakeUp();
};

exec.onTriggered = () =>
{
    const world = op.patch.frameStore.rapier?.world;
    if (!world) return;
    if (!inActive.get()) return;

    eventQueue = op.patch.frameStore.rapier.eventQueue;
    if (eventQueue) {}

    if (CABLES.UI)
        gui.setTransform(op.id, inTranslX.get(), inTranslY.get(), inTranslZ.get(), op.uiAttribs.comment || inName.get());

    if (world != lastWorld)
    {
        needsSetup = true;
        setupReason = "world changed";

        removeBodies();
    }
    if (rigidBodies.length == 0)
    {
        setupReason = "no bodies";
        needsSetup = true;
    }
    if (setPosition && getPositions().length / 3 != rigidBodies.length)
    {
        setupReason = "number of positions changed";
        needsSetup = true;
    }
    if (needsSetup) setup(world);

    const posArray = [];
    const rotArray = [];
    const sizeArray = [];

    let sleepCount = 0;
    for (let i = 0; i < rigidBodies.length; i++)
        if (rigidBodies[i].isSleeping()) sleepCount++;

    outSleeping.set(sleepCount != rigidBodies.length);

    if (setPosition)
    {
        const posArr = getPositions(); // inPositions.get();
        const rotArr = getRotations(posArr.length / 3);

        setPosition = false;
        const scale = getScaling();
        if (float32Diff(glScale[0], scale[0]) || float32Diff(glScale[1], scale[1]) || float32Diff(glScale[2], scale[2]))
        {
            setupReason = "scale changed...";
            needsSetup = true;
        }

        for (let i = 0; i < rigidBodies.length; i++)
        {
            rigidBodies[i].setTranslation({ "x": posArr[i * 3 + 0], "y": posArr[i * 3 + 1], "z": posArr[i * 3 + 2] }, true);
            rigidBodies[i].setRotation({ "x": rotArr[i * 4 + 0], "y": rotArr[i * 4 + 1], "z": rotArr[i * 4 + 2], "w": rotArr[i * 4 + 3] }, true);
        }
    }

    for (let i = 0; i < rigidBodies.length; i++)
    {
        const pos = rigidBodies[i].translation();
        const rot = rigidBodies[i].rotation();

        posArray.push(pos.x, pos.y, pos.z);
        rotArray.push(rot.x, rot.y, rot.z, rot.w);
        sizeArray.push(shapeSize[0], shapeSize[1], shapeSize[2]);
    }

    outPos.setRef(posArray);
    outRot.setRef(rotArray);
    outSize.setRef(sizeArray);

    if (inRender.get()) renderBodies(posArray, rotArray);

    if (!inEvents.get())
        for (let i = 0; i < rigidBodies.length; i++)
            op.patch.frameStore.rapier.ignoreEventHandles.push(rigidBodies[i].handle);

    next.trigger();
};

function getRotations(numBodies)
{
    const roti = quat.create();
    const rot = new Array(numBodies * 4);

    if (inTrans.get()) mat4.getRotation(roti, op.patch.cgl.mMatrix);

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
    const posv = vec3.create();
    let pos = structuredClone(inPositions.get()) || [0, 0, 0];

    if (inTrans.get())
    {
        mat4.getScaling(scale, op.patch.cgl.mMatrix);
        mat4.getTranslation(translati, op.patch.cgl.mMatrix);
    }

    for (let i = 0; i < pos.length; i += 3)
    {
        vec3.set(posv, pos[i], pos[i + 1], pos[i + 2]);
        vec3.transformMat4(posv, posv, op.patch.cgl.mMatrix);

        pos[i] = posv[0] + inTranslX.get();
        pos[i + 1] = posv[1] + inTranslY.get();
        pos[i + 2] = posv[2] + inTranslZ.get();
    }
    return pos;
}

function updateUi()
{
    if (!CABLES.UI) return;

    let useRadius = true;
    let useSizeX = false;
    let useSizeY = false;
    let useSizeZ = false;

    if (inCollShape.get() == "Capsule" || inCollShape.get() == "Cuboid" || inCollShape.get() == "Cylinder")
    {
        useSizeX = true;
        useSizeY = true;
        useSizeZ = true;
    }

    if (inCollShape.get() != "Ball" && inCollShape.get() != "Cylinder" && inCollShape.get() != "Capsule")
    {
        useRadius = false;
    }

    const physProps = inType.get() != "Dynamic";

    inFriction.setUiAttribs({ "greyout": physProps });
    inDensity.setUiAttribs({ "greyout": physProps });
    inRestitution.setUiAttribs({ "greyout": physProps });
    inMass.setUiAttribs({ "greyout": physProps });
    inDampLin.setUiAttribs({ "greyout": physProps });
    inDampAng.setUiAttribs({ "greyout": physProps });

    inCollRadius.setUiAttribs({ "greyout": !useRadius });
    inCollSizeX.setUiAttribs({ "greyout": !useSizeX });
    inCollSizeY.setUiAttribs({ "greyout": !useSizeY });
    inCollSizeZ.setUiAttribs({ "greyout": !useSizeZ });

    const renderable = isRenderableShape();
    inRender.setUiAttribs({ "greyout": !renderable });
    if (inRender.get() && !renderable) op.setUiError("norender", "Render only supports Cuboid, Ball, Cylinder and Capsule, use Result outputs with a mesh instancer", 0);
    else op.setUiError("norender", null);
}

function isRenderableShape()
{
    const shape = inCollShape.get();
    return shape == "Cuboid" || shape == "Ball" || shape == "Cylinder" || shape == "Capsule";
}

function updateShapeSize(sizeX, sizeY, sizeZ, sizeR)
{
    const shape = inCollShape.get();
    const radius = sizeR * glScale[0];

    if (shape == "Cuboid") vec3.set(shapeSize, sizeX * glScale[0] * 2, sizeY * glScale[1] * 2, sizeZ * glScale[2] * 2);
    else if (shape == "Ball") vec3.set(shapeSize, radius * 2, radius * 2, radius * 2);
    else if (shape == "Cylinder") vec3.set(shapeSize, radius * 2, sizeY * glScale[1] * 2, radius * 2);
    else if (shape == "Capsule") vec3.set(shapeSize, radius * 2, (sizeY * glScale[1] + radius) * 2, radius * 2);
    else vec3.copy(shapeSize, glScale);

    vec3.scale(renderScale, shapeSize, 0.5);

    if (shape == "Capsule")
    {
        vec3.set(renderScale, 1, 1, 1);
        const halfHeight = sizeY * glScale[1];
        if (radius != capsuleRadius || halfHeight != capsuleHalfHeight)
        {
            capsuleRadius = radius;
            capsuleHalfHeight = halfHeight;
            if (shapeMeshes.Capsule)
            {
                shapeMeshes.Capsule.dispose();
                delete shapeMeshes.Capsule;
            }
        }
    }
}

function getShapeMesh(shape)
{
    if (shapeMeshes[shape]) return shapeMeshes[shape];

    if (shape == "Cuboid") shapeMeshes[shape] = CGL.MESHES.getSimpleCube(cgl, op.name + " cube");
    else if (shape == "Ball") shapeMeshes[shape] = new CGL.Mesh(cgl, buildSphereGeom());
    else if (shape == "Cylinder") shapeMeshes[shape] = new CGL.Mesh(cgl, buildCylinderGeom());
    else if (shape == "Capsule") shapeMeshes[shape] = new CGL.Mesh(cgl, buildCapsuleGeom(capsuleRadius, capsuleHalfHeight));

    return shapeMeshes[shape];
}

function buildCapsuleGeom(radius, halfHeight)
{
    const verts = [];
    const normals = [];
    const texCoords = [];
    const indices = [];
    const totalHeight = (halfHeight + radius) * 2;
    let numRows = 0;

    for (let i = 0; i <= SPHERE_RINGS; i++)
    {
        const theta = i / SPHERE_RINGS * Math.PI;
        const isEquator = i == SPHERE_RINGS / 2;
        const offsets = isEquator ? [halfHeight, -halfHeight] : [i < SPHERE_RINGS / 2 ? halfHeight : -halfHeight];

        for (let k = 0; k < offsets.length; k++)
        {
            for (let j = 0; j <= SPHERE_SEGMENTS; j++)
            {
                const phi = j / SPHERE_SEGMENTS * Math.PI * 2;
                const nx = Math.sin(theta) * Math.cos(phi);
                const ny = Math.cos(theta);
                const nz = Math.sin(theta) * Math.sin(phi);
                const y = ny * radius + offsets[k];
                verts.push(nx * radius, y, nz * radius);
                normals.push(nx, ny, nz);
                texCoords.push(j / SPHERE_SEGMENTS, y / totalHeight + 0.5);
            }
            numRows++;
        }
    }

    const rowLength = SPHERE_SEGMENTS + 1;
    for (let i = 0; i < numRows - 1; i++)
    {
        for (let j = 0; j < SPHERE_SEGMENTS; j++)
        {
            const a = i * rowLength + j;
            const b = a + rowLength;
            indices.push(a, a + 1, b, b, a + 1, b + 1);
        }
    }

    return createGeom("rapier capsule", verts, normals, texCoords, indices);
}

function buildSphereGeom()
{
    const verts = [];
    const normals = [];
    const texCoords = [];
    const indices = [];

    for (let i = 0; i <= SPHERE_RINGS; i++)
    {
        const theta = i / SPHERE_RINGS * Math.PI;
        for (let j = 0; j <= SPHERE_SEGMENTS; j++)
        {
            const phi = j / SPHERE_SEGMENTS * Math.PI * 2;
            const x = Math.sin(theta) * Math.cos(phi);
            const y = Math.cos(theta);
            const z = Math.sin(theta) * Math.sin(phi);
            verts.push(x, y, z);
            normals.push(x, y, z);
            texCoords.push(j / SPHERE_SEGMENTS, 1 - i / SPHERE_RINGS);
        }
    }

    const rowLength = SPHERE_SEGMENTS + 1;
    for (let i = 0; i < SPHERE_RINGS; i++)
    {
        for (let j = 0; j < SPHERE_SEGMENTS; j++)
        {
            const a = i * rowLength + j;
            const b = a + rowLength;
            indices.push(a, a + 1, b, b, a + 1, b + 1);
        }
    }

    return createGeom("rapier sphere", verts, normals, texCoords, indices);
}

function buildCylinderGeom()
{
    const verts = [];
    const normals = [];
    const texCoords = [];
    const indices = [];

    for (let j = 0; j <= CYLINDER_SEGMENTS; j++)
    {
        const phi = j / CYLINDER_SEGMENTS * Math.PI * 2;
        const x = Math.cos(phi);
        const z = Math.sin(phi);
        verts.push(x, 1, z, x, -1, z);
        normals.push(x, 0, z, x, 0, z);
        texCoords.push(j / CYLINDER_SEGMENTS, 1, j / CYLINDER_SEGMENTS, 0);
    }

    for (let j = 0; j < CYLINDER_SEGMENTS; j++)
    {
        const a = j * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }

    addCylinderCap(verts, normals, texCoords, indices, 1);
    addCylinderCap(verts, normals, texCoords, indices, -1);

    return createGeom("rapier cylinder", verts, normals, texCoords, indices);
}

function addCylinderCap(verts, normals, texCoords, indices, side)
{
    const center = verts.length / 3;
    verts.push(0, side, 0);
    normals.push(0, side, 0);
    texCoords.push(0.5, 0.5);

    for (let j = 0; j <= CYLINDER_SEGMENTS; j++)
    {
        const phi = j / CYLINDER_SEGMENTS * Math.PI * 2;
        const x = Math.cos(phi);
        const z = Math.sin(phi);
        verts.push(x, side, z);
        normals.push(0, side, 0);
        texCoords.push(x * 0.5 + 0.5, z * 0.5 + 0.5);
    }

    for (let j = 0; j < CYLINDER_SEGMENTS; j++)
    {
        const a = center + 1 + j;
        if (side > 0) indices.push(center, a + 1, a);
        else indices.push(center, a, a + 1);
    }
}

function createGeom(name, verts, normals, texCoords, indices)
{
    const geom = new CGL.Geometry(name);
    geom.vertices = verts;
    geom.vertexNormals = normals;
    geom.texCoords = texCoords;
    geom.verticesIndices = indices;
    geom.calcTangentsBitangents();
    return geom;
}

function renderBodies(posArray, rotArray)
{
    if (!isRenderableShape()) return;

    const mesh = getShapeMesh(inCollShape.get());
    if (!mesh) return;

    const shader = cgl.getShader();
    cgl.pushModelMatrix();

    for (let i = 0; i < posArray.length / 3; i++)
    {
        vec3.set(renderPos, posArray[i * 3 + 0], posArray[i * 3 + 1], posArray[i * 3 + 2]);
        quat.set(renderRot, rotArray[i * 4 + 0], rotArray[i * 4 + 1], rotArray[i * 4 + 2], rotArray[i * 4 + 3]);
        mat4.fromRotationTranslationScale(cgl.mMatrix, renderRot, renderPos, renderScale);
        mesh.render(shader);
    }

    cgl.popModelMatrix();
}

function disposeMeshes()
{
    for (const shape in shapeMeshes)
    {
        shapeMeshes[shape].dispose();
        delete shapeMeshes[shape];
    }
}

function getScaling()
{
    const scale = vec3.create();
    vec3.set(scale, 1, 1, 1);
    if (op.patch.cgl) mat4.getScaling(scale, op.patch.cgl.mMatrix);

    return scale;
}

function setup(world)
{
    removeBodies();
    setupReason = "";

    const pos = getPositions();
    const rot = getRotations(pos.length / 3);
    const scal = inScales.get();

    glScale = getScaling();
    if (glScale[0] == 0) return;
    if (pos.length == 0) return;

    op.patch.cgl.profileData.addHeavyEvent("rapier body constructed", inName.get());

    let sizeY = Math.abs(inCollSizeY.get());
    let sizeX = Math.abs(inCollSizeX.get());
    let sizeZ = Math.abs(inCollSizeZ.get());
    let sizeR = Math.abs(inCollRadius.get());
    let colliderDesc, collider;
    updateShapeSize(sizeX, sizeY, sizeZ, sizeR);

    if (inCollShape.get() == "Capsule") colliderDesc = RAPIER.ColliderDesc.capsule(sizeY * glScale[1], sizeR * glScale[0]);
    else if (inCollShape.get() == "Cylinder") colliderDesc = RAPIER.ColliderDesc.cylinder(sizeY * glScale[1], sizeR * glScale[0]);
    else if (inCollShape.get() == "Cuboid") colliderDesc = RAPIER.ColliderDesc.cuboid(sizeX * glScale[0], sizeY * glScale[1], sizeZ * glScale[2]);
    else if (inCollShape.get() == "Ball") colliderDesc = RAPIER.ColliderDesc.ball(sizeR * glScale[0]);
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

            geom.scale(glScale[0], glScale[1], glScale[2]);

            colliderDesc = RAPIER.ColliderDesc.trimesh(geom.vertices, faces);
        }
    }
    else if (inCollShape.get() == "Convex Hull")
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
            geom.scale(glScale[0], glScale[1], glScale[2]);
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

        colliderDesc
            .setMass(inMass.get())
            .setRestitution(inRestitution.get())
            .setDensity(inDensity.get())
            .setFriction(inFriction.get())
            .setSensor(inSensor.get());

        const rigidBody = world.createRigidBody(rigidBodyDesc);

        rigidBody.userData = { "name": inName.get() + "." + i / 3 };
        rigidBody.setBodyType(inType.indexPort.get());
        rigidBodies.push(rigidBody);

        collider = world.createCollider(colliderDesc, rigidBody);
        colliders.push(collider);

        let collTypes = RAPIER.ActiveCollisionTypes.DEFAULT;
        if (inEvtFixFix.get()) collTypes |= RAPIER.ActiveCollisionTypes.FIXED_FIXED;

        collider.setActiveCollisionTypes(collTypes);
        if (!inEvents.get())
        {
            collider.setActiveEvents(RAPIER.ActiveEvents.NONE);
        }
        else
        {
            collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
        }
    }

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
    disposeMeshes();
};

op.on("onEnabledChange", () =>
{
    removeBodies();
});

/// ////////
