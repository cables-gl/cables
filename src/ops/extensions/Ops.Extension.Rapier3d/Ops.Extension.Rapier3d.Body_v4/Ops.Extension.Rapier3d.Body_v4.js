const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", "default"),
    inCollShape = op.inDropDown("Body Shape", ["Cuboid", "Ball", "Cylinder", "Capsule", "Tri Mesh", "Convex Hull"], "Cuboid"),
    inType = op.inDropDown("Type", ["Dynamic", "Fixed", "KinematicPositionBased", "KinematicVelocityBased"], "Dynamic"),
    inRender = op.inBool("Render", true),

    inTranslX = op.inFloat("Translate X", 0.0),
    inTranslY = op.inFloat("Translate Y", 0.0),
    inTranslZ = op.inFloat("Translate Z", 0.0),
    inTrans = op.inBool("Transform", true),

    inCollRadius = op.inFloat("Radius", 0.5),
    inCollSizeX = op.inFloat("Size X", 0.5),
    inCollSizeY = op.inFloat("Size Y", 0.5),
    inCollSizeZ = op.inFloat("Size Z", 0.5),
    inGeom = op.inObject("Geometry", null, "geometry"),

    inMass = op.inFloat("Mass", 0),
    inDensity = op.inFloat("Density", 1),
    inFriction = op.inFloat("Friction", 1),
    inRestitution = op.inFloat("Restitution", 0.3),
    inDampLin = op.inFloat("Linear Damping", 1),
    inDampAng = op.inFloat("Angular Damping", 1),
    inSensor = op.inBool("Sensor", false),

    inGroup = op.inInt("Collision Group", 1),
    inCollidesWith = op.inString("Collides With", ""),

    inPositions = op.inArray("Positions", null, 3),
    inScales = op.inArray("Scalings", null, 3),
    inRots = op.inArray("Rotations", null, 4),

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
op.setPortGroup("Properties", [inMass, inDensity, inFriction, inRestitution, inDampLin, inDampAng, inSensor]);
op.setPortGroup("Collision Groups", [inGroup, inCollidesWith]);
op.setPortGroup("Instances", [inPositions, inScales, inRots]);
op.setPortGroup("Collision Events", [inEvents, inEvtFixFix]);
op.setPortGroup("Simulation", [inActive, inUpdateTrans, inWakeup]);

const cgl = op.patch.cgl;
const SPHERE_RINGS = 16;
const SPHERE_SEGMENTS = 24;
const CYLINDER_SEGMENTS = 24;
const SCALE_EPSILON = 0.0001;
const TINY_SIZE = 0.02;

const DEFAULT_COLLISION_GROUPS = 0xffffffff;
let collisionGroups = DEFAULT_COLLISION_GROUPS;
let groupsChanged = true;

let lastWorld = null;
let needsSetup = true;
let setPosition = false;
let rigidBodies = [];
let colliders = [];
let bodySizes = [];
let modelScale = vec3.fromValues(1, 1, 1);

const posArray = [];
const rotArray = [];
const sizeArray = [];

const renderScale = vec3.create();
const renderPos = vec3.create();
const renderRot = quat.create();
const shapeMeshes = {};
let capsuleRadius = 0;
let capsuleHalfHeight = 0;

exec.onLinkChanged = removeBodies;
inRender.onChange = updateUi;

inPositions.onChange =
    inRots.onChange =
    inUpdateTrans.onTriggered = () => { setPosition = true; };

inPositions.onLinkChanged =
    inScales.onLinkChanged =
    inRots.onLinkChanged =
    inScales.onChange =
    inTrans.onChange =
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
        updateTitle();
        needsSetup = true;
    };

function updateTitle()
{
    let title = inType.get() + " " + inCollShape.get() + " ";
    if (inSensor.get()) title += "sensor ";
    if (inGroup.get() != 1 || inCollidesWith.get()) title += "group " + inGroup.get() + " ";
    title += inName.get();
    op.setUiAttrib({ "extendTitle": title });
}

inGroup.onChange =
    inCollidesWith.onChange = () =>
    {
        updateTitle();
        groupsChanged = true;
    };

function updateCollisionGroups(tools)
{
    if (!tools) return;

    collisionGroups = tools.getCollisionGroups(inGroup.get(), inCollidesWith.get());
    groupsChanged = false;

    if (tools.collidesWithNothing(collisionGroups)) op.setUiError("groupfilter", "Collides With has no valid group (1-" + tools.GROUP_COUNT + "), body collides with nothing", 1);
    else op.setUiError("groupfilter", null);

    for (let i = 0; i < colliders.length; i++) colliders[i].setCollisionGroups(collisionGroups);
}

inTranslX.onChange =
    inTranslY.onChange =
    inTranslZ.onChange = () =>
    {
        if (inType.get() == "Dynamic") needsSetup = true;
        else setPosition = true;
    };

inActive.onChange = () =>
{
    if (!inActive.get()) removeBodies();
    needsSetup = true;
};

inWakeup.onTriggered = () =>
{
    for (let i = 0; i < rigidBodies.length; i++) rigidBodies[i].wakeUp();
};

op.onDelete = () =>
{
    removeBodies();
    disposeMeshes();
};

op.on("onEnabledChange", removeBodies);

exec.onTriggered = () =>
{
    const world = op.patch.frameStore.rapier?.world;
    if (!world || !inActive.get()) return;

    if (CABLES.UI) gui.setTransform(op.id, inTranslX.get(), inTranslY.get(), inTranslZ.get(), op.uiAttribs.comment || inName.get());

    if (world != lastWorld)
    {
        rigidBodies.length = 0;
        colliders.length = 0;
        needsSetup = true;
    }
    if (rigidBodies.length == 0) needsSetup = true;
    if (groupsChanged) updateCollisionGroups(op.patch.frameStore.rapier.tools);

    if (setPosition)
    {
        const positions = getPositions();
        if (positions.length / 3 != rigidBodies.length || scaleChanged()) needsSetup = true;
        else applyTransforms(positions);
        setPosition = false;
    }

    if (needsSetup) setup(world);

    updateOutputs();

    if (inRender.get()) renderBodies();

    if (!inEvents.get())
        for (let i = 0; i < rigidBodies.length; i++)
            op.patch.frameStore.rapier.ignoreEventHandles.push(rigidBodies[i].handle);

    next.trigger();
};

function updateOutputs()
{
    posArray.length = 0;
    rotArray.length = 0;
    sizeArray.length = 0;

    let sleepCount = 0;
    for (let i = 0; i < rigidBodies.length; i++)
    {
        const body = rigidBodies[i];
        if (body.isSleeping()) sleepCount++;

        const pos = body.translation();
        const rot = body.rotation();
        posArray.push(pos.x, pos.y, pos.z);
        rotArray.push(rot.x, rot.y, rot.z, rot.w);
        sizeArray.push(bodySizes[i * 3], bodySizes[i * 3 + 1], bodySizes[i * 3 + 2]);
    }

    outSleeping.set(rigidBodies.length > 0 && sleepCount == rigidBodies.length);
    outPos.setRef(posArray);
    outRot.setRef(rotArray);
    outSize.setRef(sizeArray);
}

function getModelScale()
{
    const scale = vec3.fromValues(1, 1, 1);
    if (inTrans.get()) mat4.getScaling(scale, cgl.mMatrix);
    return scale;
}

function scaleChanged()
{
    const scale = getModelScale();
    return Math.abs(scale[0] - modelScale[0]) > SCALE_EPSILON ||
        Math.abs(scale[1] - modelScale[1]) > SCALE_EPSILON ||
        Math.abs(scale[2] - modelScale[2]) > SCALE_EPSILON;
}

function getPositions()
{
    const input = inPositions.get();
    const pos = (input && input.length >= 3) ? Array.from(input) : [0, 0, 0];
    const v = vec3.create();

    for (let i = 0; i + 2 < pos.length; i += 3)
    {
        vec3.set(v, pos[i], pos[i + 1], pos[i + 2]);
        if (inTrans.get()) vec3.transformMat4(v, v, cgl.mMatrix);

        pos[i] = v[0] + inTranslX.get();
        pos[i + 1] = v[1] + inTranslY.get();
        pos[i + 2] = v[2] + inTranslZ.get();
    }
    pos.length -= pos.length % 3;
    return pos;
}

function getRotation(index, out)
{
    quat.identity(out);
    if (inTrans.get()) mat4.getRotation(out, cgl.mMatrix);

    const rots = inRots.get();
    if (rots && rots.length >= (index + 1) * 4)
    {
        const bodyRot = quat.fromValues(rots[index * 4], rots[index * 4 + 1], rots[index * 4 + 2], rots[index * 4 + 3]);
        quat.normalize(bodyRot, bodyRot);
        quat.multiply(out, out, bodyRot);
    }
    return out;
}

function getBodyScale(index, out)
{
    vec3.copy(out, modelScale);
    const scales = inScales.get();
    if (scales && scales.length >= (index + 1) * 3)
    {
        out[0] *= scales[index * 3];
        out[1] *= scales[index * 3 + 1];
        out[2] *= scales[index * 3 + 2];
    }
    return out;
}

function applyTransforms(positions)
{
    const rot = quat.create();
    for (let i = 0; i < rigidBodies.length; i++)
    {
        getRotation(i, rot);
        const translation = { "x": positions[i * 3], "y": positions[i * 3 + 1], "z": positions[i * 3 + 2] };
        const rotation = { "x": rot[0], "y": rot[1], "z": rot[2], "w": rot[3] };

        if (inType.get() == "KinematicPositionBased")
        {
            rigidBodies[i].setNextKinematicTranslation(translation);
            rigidBodies[i].setNextKinematicRotation(rotation);
        }
        else
        {
            rigidBodies[i].setTranslation(translation, true);
            rigidBodies[i].setRotation(rotation, true);
        }
    }
}

function createBodyDesc()
{
    const type = inType.get();
    if (type == "Fixed") return RAPIER.RigidBodyDesc.fixed();
    if (type == "KinematicPositionBased") return RAPIER.RigidBodyDesc.kinematicPositionBased();
    if (type == "KinematicVelocityBased") return RAPIER.RigidBodyDesc.kinematicVelocityBased();
    return RAPIER.RigidBodyDesc.dynamic();
}

function getScaledGeom(scale)
{
    const geom = inGeom.get();
    if (!geom || !geom.vertices || geom.vertices.length == 0) return null;

    const scaled = geom.copy();
    scaled.scale(scale[0], scale[1], scale[2]);
    return scaled;
}

function createColliderDesc(scale)
{
    const shape = inCollShape.get();
    const radius = Math.abs(inCollRadius.get()) * scale[0];
    const sizeX = Math.abs(inCollSizeX.get()) * scale[0];
    const sizeY = Math.abs(inCollSizeY.get()) * scale[1];
    const sizeZ = Math.abs(inCollSizeZ.get()) * scale[2];
    let desc = null;

    if (shape == "Capsule") desc = RAPIER.ColliderDesc.capsule(sizeY, radius);
    else if (shape == "Cylinder") desc = RAPIER.ColliderDesc.cylinder(sizeY, radius);
    else if (shape == "Cuboid") desc = RAPIER.ColliderDesc.cuboid(sizeX, sizeY, sizeZ);
    else if (shape == "Ball") desc = RAPIER.ColliderDesc.ball(radius);
    else
    {
        const geom = getScaledGeom(scale);
        if (geom && shape == "Tri Mesh")
        {
            let indices = geom.verticesIndices;
            if (!indices || indices.length == 0)
            {
                indices = [];
                for (let i = 0; i < geom.vertices.length / 3; i++) indices.push(i);
            }
            desc = RAPIER.ColliderDesc.trimesh(new Float32Array(geom.vertices), new Uint32Array(indices));
        }
        else if (geom && shape == "Convex Hull") desc = RAPIER.ColliderDesc.convexHull(new Float32Array(geom.vertices));
    }

    if (!desc)
    {
        op.setUiError("nogeom", "Shape needs a valid geometry, using a tiny cube", 1);
        desc = RAPIER.ColliderDesc.cuboid(TINY_SIZE, TINY_SIZE, TINY_SIZE);
    }
    else op.setUiError("nogeom", null);

    desc.setRestitution(inRestitution.get())
        .setFriction(inFriction.get())
        .setSensor(inSensor.get())
        .setCollisionGroups(collisionGroups);

    if (inMass.get() > 0) desc.setMass(inMass.get());
    else desc.setDensity(inDensity.get());

    let collTypes = RAPIER.ActiveCollisionTypes.DEFAULT;
    if (inEvtFixFix.get()) collTypes |= RAPIER.ActiveCollisionTypes.FIXED_FIXED;
    desc.setActiveCollisionTypes(collTypes);
    desc.setActiveEvents(inEvents.get() ? RAPIER.ActiveEvents.COLLISION_EVENTS : RAPIER.ActiveEvents.NONE);

    return desc;
}

function getShapeSize(scale, out, index)
{
    const shape = inCollShape.get();
    const radius = Math.abs(inCollRadius.get()) * scale[0];
    const sizeY = Math.abs(inCollSizeY.get()) * scale[1];

    let w = scale[0],
        h = scale[1],
        d = scale[2];
    if (shape == "Cuboid")
    {
        w = Math.abs(inCollSizeX.get()) * scale[0] * 2;
        h = sizeY * 2;
        d = Math.abs(inCollSizeZ.get()) * scale[2] * 2;
    }
    else if (shape == "Ball") w = h = d = radius * 2;
    else if (shape == "Cylinder")
    {
        w = d = radius * 2;
        h = sizeY * 2;
    }
    else if (shape == "Capsule")
    {
        w = d = radius * 2;
        h = (sizeY + radius) * 2;
    }

    out[index * 3] = w;
    out[index * 3 + 1] = h;
    out[index * 3 + 2] = d;
}

function setup(world)
{
    removeBodies();
    needsSetup = false;
    lastWorld = world;

    modelScale = getModelScale();
    if (modelScale[0] == 0 || modelScale[1] == 0 || modelScale[2] == 0) return;

    const positions = getPositions();
    const numBodies = positions.length / 3;
    if (numBodies == 0) return;

    op.patch.cgl.profileData.addHeavyEvent("rapier body constructed", inName.get());

    bodySizes = new Float32Array(numBodies * 3);
    const rot = quat.create();
    const scale = vec3.create();

    for (let i = 0; i < numBodies; i++)
    {
        getRotation(i, rot);
        getBodyScale(i, scale);
        getShapeSize(scale, bodySizes, i);

        const bodyDesc = createBodyDesc()
            .setLinearDamping(inDampLin.get())
            .setAngularDamping(inDampAng.get())
            .setTranslation(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
            .setRotation({ "x": rot[0], "y": rot[1], "z": rot[2], "w": rot[3] });

        const rigidBody = world.createRigidBody(bodyDesc);
        rigidBody.userData = { "name": inName.get() + "." + i };
        rigidBodies.push(rigidBody);

        colliders.push(world.createCollider(createColliderDesc(scale), rigidBody));
    }

    outCollider.setRef(colliders);
    outBodies.setRef(rigidBodies);
    updateCapsuleMesh();
    updateUi();
}

function removeBodies()
{
    if (lastWorld)
        for (let i = 0; i < rigidBodies.length; i++) lastWorld.removeRigidBody(rigidBodies[i]);

    rigidBodies.length = 0;
    colliders.length = 0;
    outCollider.setRef([]);
    outBodies.setRef([]);
    updateOutputs();
}

function updateUi()
{
    if (!CABLES.UI) return;

    const shape = inCollShape.get();
    const useRadius = shape == "Ball" || shape == "Cylinder" || shape == "Capsule";
    const useSizeXZ = shape == "Cuboid";
    const useSizeY = shape == "Cuboid" || shape == "Cylinder" || shape == "Capsule";
    const useGeom = shape == "Tri Mesh" || shape == "Convex Hull";
    const notDynamic = inType.get() != "Dynamic";

    inMass.setUiAttribs({ "greyout": notDynamic });
    inDensity.setUiAttribs({ "greyout": notDynamic || inMass.get() > 0 });
    inDampLin.setUiAttribs({ "greyout": notDynamic });
    inDampAng.setUiAttribs({ "greyout": notDynamic });

    inCollRadius.setUiAttribs({ "greyout": !useRadius });
    inCollSizeX.setUiAttribs({ "greyout": !useSizeXZ });
    inCollSizeY.setUiAttribs({ "greyout": !useSizeY });
    inCollSizeZ.setUiAttribs({ "greyout": !useSizeXZ });
    inGeom.setUiAttribs({ "greyout": !useGeom });

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

function updateCapsuleMesh()
{
    if (inCollShape.get() != "Capsule") return;

    const radius = Math.abs(inCollRadius.get());
    const halfHeight = Math.abs(inCollSizeY.get());
    if (radius == capsuleRadius && halfHeight == capsuleHalfHeight) return;

    capsuleRadius = radius;
    capsuleHalfHeight = halfHeight;
    if (shapeMeshes.Capsule)
    {
        shapeMeshes.Capsule.dispose();
        delete shapeMeshes.Capsule;
    }
}

function renderBodies()
{
    if (!isRenderableShape() || rigidBodies.length == 0) return;

    const shape = inCollShape.get();
    const mesh = getShapeMesh(shape);
    if (!mesh) return;

    const shader = cgl.getShader();
    const scale = vec3.create();
    cgl.pushModelMatrix();

    for (let i = 0; i < rigidBodies.length; i++)
    {
        if (shape == "Capsule") getBodyScale(i, renderScale);
        else vec3.set(renderScale, bodySizes[i * 3] * 0.5, bodySizes[i * 3 + 1] * 0.5, bodySizes[i * 3 + 2] * 0.5);

        vec3.set(renderPos, posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]);
        quat.set(renderRot, rotArray[i * 4], rotArray[i * 4 + 1], rotArray[i * 4 + 2], rotArray[i * 4 + 3]);
        mat4.fromRotationTranslationScale(cgl.mMatrix, renderRot, renderPos, renderScale);
        mesh.render(shader);
    }

    cgl.popModelMatrix();
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

function disposeMeshes()
{
    for (const shape in shapeMeshes)
    {
        shapeMeshes[shape].dispose();
        delete shapeMeshes[shape];
    }
}

function buildSphereGeom()
{
    return buildRoundGeom("rapier sphere", 1, 0);
}

function buildCapsuleGeom(radius, halfHeight)
{
    return buildRoundGeom("rapier capsule", radius, halfHeight);
}

function buildRoundGeom(name, radius, halfHeight)
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
        const isEquator = halfHeight > 0 && i == SPHERE_RINGS / 2;
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

    return createGeom(name, verts, normals, texCoords, indices);
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
