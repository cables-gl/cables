const
    exec = op.inTrigger("Trigger"),
    inName = op.inString("Name", "soft body default"),
    inType = op.inDropDown("Type", ["Volumetric", "Tri Mesh"], "Tri Mesh"),
    inGeom = op.inObject("Geometry", null, "geometry"),
    inCellSize = op.inFloat("Cell Size", 0.2),
    inSkinCollision = op.inBool("Skin Collision", false),

    inStiffness = op.inFloat("Stiffness", 2),
    inDamping = op.inFloat("Damping Ratio", 1),
    inCellModel = op.inDropDown("Cell Model", ["Volume", "Corotational", "NeoHookean"], "NeoHookean"),
    inSolver = op.inDropDown("Solver", ["Constraints", "Fem"], "Constraints"),
    inVolume = op.inBool("Volume Preservation", false),
    inSelfContacts = op.inBool("Self Contacts", false),

    inMass = op.inFloat("Mass", 3),
    inFriction = op.inFloat("Friction", 0.8),
    inRestitution = op.inFloat("Restitution", 0.5),
    inDampLin = op.inFloat("Linear Damping", 0),
    inGravityScale = op.inFloat("Gravity Scale", 0.5),

    inPinPositions = op.inArray("Pin Positions", null, 3),
    inPinRadius = op.inFloat("Pin Radius", 0),

    inRender = op.inBool("Render", true),
    inActive = op.inBool("Active", true),
    inReset = op.inTriggerButton("Reset"),

    next = op.outTrigger("Next"),
    outPositions = op.outArray("Particle Positions", [], 3),
    outNumParticles = op.outNumber("Num Particles"),
    outSoftBody = op.outObject("Soft Body");

op.setPortGroup("Shape", [inType, inGeom, inCellSize, inSkinCollision]);
op.setPortGroup("Material", [inStiffness, inDamping, inCellModel, inSolver, inVolume, inSelfContacts]);
op.setPortGroup("Physics", [inMass, inFriction, inRestitution, inDampLin, inGravityScale]);
op.setPortGroup("Pinning", [inPinPositions, inPinRadius]);

const WELD_PRECISION = 1e5;
const PLACEHOLDER_COLLIDER_SIZE = 0.1;

const cgl = op.patch.cgl;

let softBody = null;
let lastWorld = null;
let needsSetup = true;
let mesh = null;

let weldedIndices = null;
let weldedNormals = null;

let vertToWelded = null;
let renderPositions = null;
let renderNormals = null;

let skinMeshIndex = -1;

let grabbed = [];
let grabbedNumPins = 0;
let grabbedRadius = 0;
let pinsChanged = true;

exec.onLinkChanged = removeSoftBody;
inReset.onTriggered = () => { needsSetup = true; };

inName.onChange =
    inType.onChange =
    inGeom.onChange =
    inCellSize.onChange =
    inSkinCollision.onChange =
    inStiffness.onChange =
    inDamping.onChange =
    inCellModel.onChange =
    inSolver.onChange =
    inVolume.onChange =
    inSelfContacts.onChange =
    inMass.onChange =
    inFriction.onChange =
    inRestitution.onChange =
    inDampLin.onChange =
    inGravityScale.onChange = () =>
    {
        op.setUiAttrib({ "extendTitle": inType.get() + " " + inName.get() });
        needsSetup = true;
        updateUi();
    };

inPinPositions.onChange =
    inPinRadius.onChange = () =>
    {
        pinsChanged = true;
    };

inActive.onChange = () =>
{
    if (!inActive.get()) removeSoftBody();
    needsSetup = true;
};

exec.onTriggered = () =>
{
    const world = op.patch.frameStore.rapier?.world;
    if (!world || !inActive.get())
    {
        next.trigger();
        return;
    }

    if (world != lastWorld)
    {
        forgetSoftBody();
        needsSetup = true;
    }
    if (needsSetup) setup(world);

    if (softBody && softBody.isValid())
    {
        if (pinsChanged) updatePins();

        const positions = simulatedVertices();
        outPositions.setRef(softBody.particlePositions());

        if (inRender.get() && mesh && positions) renderMesh(positions);
    }

    next.trigger();
};

function updateUi()
{
    inCellSize.setUiAttribs({ "greyout": inType.get() != "Volumetric" });
    inSkinCollision.setUiAttribs({ "greyout": inType.get() != "Volumetric" });
}

function weld(vertices, indices)
{
    const map = {};
    const welded = [];
    vertToWelded = new Uint32Array(vertices.length / 3);

    for (let i = 0; i < vertices.length / 3; i++)
    {
        const key = Math.round(vertices[i * 3] * WELD_PRECISION) + "_" + Math.round(vertices[i * 3 + 1] * WELD_PRECISION) + "_" + Math.round(vertices[i * 3 + 2] * WELD_PRECISION);
        if (map[key] === undefined)
        {
            map[key] = welded.length / 3;
            welded.push(vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]);
        }
        vertToWelded[i] = map[key];
    }

    const faces = [];
    for (let i = 0; i < indices.length; i += 3)
    {
        const a = vertToWelded[indices[i]], b = vertToWelded[indices[i + 1]], c = vertToWelded[indices[i + 2]];
        if (a != b && b != c && a != c) faces.push(a, b, c);
    }

    return { "vertices": new Float32Array(welded), "indices": new Uint32Array(faces) };
}

function worldVertices(geom)
{
    const v = vec3.create();
    const verts = new Float32Array(geom.vertices.length);
    for (let i = 0; i < geom.vertices.length; i += 3)
    {
        vec3.set(v, geom.vertices[i], geom.vertices[i + 1], geom.vertices[i + 2]);
        vec3.transformMat4(v, v, cgl.mMatrix);
        verts[i] = v[0];
        verts[i + 1] = v[1];
        verts[i + 2] = v[2];
    }
    return verts;
}

function releasePins()
{
    for (let i = 0; i < grabbed.length; i++) softBody.setParticlePinned(grabbed[i].particle, false);
    grabbed = [];
    grabbedNumPins = 0;
}

function grabParticles(pins, radius)
{
    releasePins();

    const particles = softBody.particlePositions();
    for (let i = 0; i < particles.length / 3; i++)
    {
        for (let j = 0; j < pins.length / 3; j++)
        {
            const dx = particles[i * 3] - pins[j * 3], dy = particles[i * 3 + 1] - pins[j * 3 + 1], dz = particles[i * 3 + 2] - pins[j * 3 + 2];
            if (dx * dx + dy * dy + dz * dz > radius * radius) continue;

            grabbed.push({ "particle": i, "pin": j, "offset": [dx, dy, dz] });
            softBody.setParticlePinned(i, true);
            break;
        }
    }

    grabbedNumPins = pins.length / 3;
    grabbedRadius = radius;
}

function moveGrabbed(pins)
{
    for (let i = 0; i < grabbed.length; i++)
    {
        const g = grabbed[i];
        softBody.setParticleKinematicTarget(g.particle, {
            "x": pins[g.pin * 3] + g.offset[0],
            "y": pins[g.pin * 3 + 1] + g.offset[1],
            "z": pins[g.pin * 3 + 2] + g.offset[2]
        });
    }
}

function updatePins()
{
    pinsChanged = false;

    const pins = inPinPositions.get();
    const radius = inPinRadius.get();

    if (!pins || pins.length < 3 || radius <= 0) releasePins();
    else if (grabbed.length == 0 || pins.length / 3 != grabbedNumPins || radius != grabbedRadius) grabParticles(pins, radius);
    else moveGrabbed(pins);

    softBody.wakeUp();
}

function setup(world)
{
    removeSoftBody();
    needsSetup = false;
    lastWorld = world;
    op.setUiError("softbody", null);

    const geom = inGeom.get();
    if (!geom || !geom.vertices || geom.vertices.length == 0)
    {
        op.setUiError("softbody", "needs a geometry", 1);
        return;
    }

    let indices = geom.verticesIndices;
    if (!indices || indices.length == 0)
    {
        indices = [];
        for (let i = 0; i < geom.vertices.length / 3; i++) indices.push(i);
    }

    const welded = weld(worldVertices(geom), indices);
    weldedIndices = welded.indices;
    weldedNormals = new Float32Array(welded.vertices.length);

    let desc = null;
    if (inType.get() == "Volumetric") desc = RAPIER.SoftBodyDesc.volumetric(welded.vertices, welded.indices, Math.max(0.001, inCellSize.get()), true);
    else desc = RAPIER.SoftBodyDesc.trimesh(welded.vertices, welded.indices);

    if (!desc)
    {
        op.setUiError("softbody", "could not create a soft body from this geometry, " + (inType.get() == "Volumetric" ? "it has to be a closed mesh" : "it is empty"), 2);
        return;
    }

    op.patch.cgl.profileData.addHeavyEvent("rapier soft body constructed", inName.get());

    const colliderDesc = RAPIER.ColliderDesc.ball(PLACEHOLDER_COLLIDER_SIZE)
        .setFriction(inFriction.get())
        .setRestitution(inRestitution.get());

    desc.setSoftness(inStiffness.get(), inDamping.get())
        .setMass(inMass.get())
        .setCellModel(inCellModel.indexPort.get())
        .setSolver(inSolver.indexPort.get())
        .setVolumePreservation(inVolume.get())
        .setSelfContacts(inSelfContacts.get())
        .setLinearDamping(inDampLin.get())
        .setGravityScale(inGravityScale.get())
        .setSurfaceCollider(colliderDesc);

    if (inType.get() == "Volumetric") desc.setSkinCollision(inSkinCollision.get());

    softBody = world.createSoftBody(desc);
    softBody.userData = { "name": inName.get() };

    grabbed = [];
    grabbedNumPins = 0;
    pinsChanged = true;

    skinMeshIndex = -1;
    if (inType.get() == "Volumetric")
    {
        for (let i = 0; i < softBody.numMeshes(); i++)
            if (softBody.isMeshSkinned(i) && softBody.meshVertices(i).length == welded.vertices.length) skinMeshIndex = i;

        if (skinMeshIndex == -1) op.setUiError("softbody", "no skin mesh found with the vertices of the geometry, rendering is off", 1);
    }

    outSoftBody.setRef(softBody);
    outNumParticles.set(softBody.numParticles());

    createMesh(geom);
}

function simulatedVertices()
{
    if (inType.get() == "Volumetric") return skinMeshIndex == -1 ? null : softBody.meshVertices(skinMeshIndex);
    return softBody.particlePositions();
}

function createMesh(geom)
{
    if (mesh) mesh.dispose();
    mesh = new CGL.Mesh(cgl, geom);
    renderPositions = new Float32Array(geom.vertices.length);
    renderNormals = new Float32Array(geom.vertices.length);
}

function calcWeldedNormals(positions)
{
    weldedNormals.fill(0);
    const a = vec3.create(), b = vec3.create(), n = vec3.create();

    for (let i = 0; i < weldedIndices.length; i += 3)
    {
        const i0 = weldedIndices[i] * 3, i1 = weldedIndices[i + 1] * 3, i2 = weldedIndices[i + 2] * 3;
        vec3.set(a, positions[i1] - positions[i0], positions[i1 + 1] - positions[i0 + 1], positions[i1 + 2] - positions[i0 + 2]);
        vec3.set(b, positions[i2] - positions[i0], positions[i2 + 1] - positions[i0 + 1], positions[i2 + 2] - positions[i0 + 2]);
        vec3.cross(n, a, b);

        for (const idx of [i0, i1, i2])
        {
            weldedNormals[idx] += n[0];
            weldedNormals[idx + 1] += n[1];
            weldedNormals[idx + 2] += n[2];
        }
    }
}

function renderMesh(positions)
{
    calcWeldedNormals(positions);

    for (let i = 0; i < vertToWelded.length; i++)
    {
        const w = vertToWelded[i] * 3;
        renderPositions[i * 3] = positions[w];
        renderPositions[i * 3 + 1] = positions[w + 1];
        renderPositions[i * 3 + 2] = positions[w + 2];

        const len = Math.hypot(weldedNormals[w], weldedNormals[w + 1], weldedNormals[w + 2]) || 1;
        renderNormals[i * 3] = weldedNormals[w] / len;
        renderNormals[i * 3 + 1] = weldedNormals[w + 1] / len;
        renderNormals[i * 3 + 2] = weldedNormals[w + 2] / len;
    }

    mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION, renderPositions, 3);
    mesh.setAttribute(CGL.SHADERVAR_VERTEX_NORMAL, renderNormals, 3);

    mesh.render(cgl.getShader());
}

function removeSoftBody()
{
    try
    {
        if (lastWorld && softBody && softBody.isValid()) lastWorld.removeSoftBody(softBody);
    }
    catch (e)
    {
        op.logWarn("could not remove soft body, world was probably reset", e.message);
    }
    forgetSoftBody();
}

function forgetSoftBody()
{
    softBody = null;
    lastWorld = null;
    grabbed = [];
    grabbedNumPins = 0;
    outSoftBody.setRef(null);
    outPositions.setRef([]);
    outNumParticles.set(0);
}

op.onDelete = () =>
{
    removeSoftBody();
    if (mesh) mesh.dispose();
};

op.on("onEnabledChange", removeSoftBody);

updateUi();
