const
    exec = op.inTrigger("Trigger"),
    inInput = op.inSwitch("Input", ["Screen", "3D"], "Screen"),
    inScreenX = op.inFloat("Screen X", 0),
    inScreenY = op.inFloat("Screen Y", 0),
    inPosX = op.inFloat("Position X", 0),
    inPosY = op.inFloat("Position Y", 0),
    inPosZ = op.inFloat("Position Z", 0),
    inReach = op.inFloat("Reach", 0.5),
    inGrab = op.inBool("Grab", false),

    inFilter = op.inString("Filter Name", ""),

    inSoftRadius = op.inFloat("Soft Body Grab Radius", 0.3),
    inStiffness = op.inFloat("Spring Stiffness", 200),
    inDamping = op.inFloat("Spring Damping", 20),

    inActive = op.inBool("Active", true),

    next = op.outTrigger("Next"),
    outGrabbing = op.outBoolNum("Grabbing"),
    outName = op.outString("Grabbed Name", ""),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z");

op.setPortGroup("Input", [inInput, inScreenX, inScreenY, inPosX, inPosY, inPosZ, inReach, inGrab]);
op.setPortGroup("Soft Bodies", [inSoftRadius]);
op.setPortGroup("Rigid Bodies", [inStiffness, inDamping]);

const RAY_MAX_DISTANCE = 10000;
const PARALLEL_EPSILON = 0.000001;

const cgl = op.patch.cgl;

const invViewProj = mat4.create();
const invView = mat4.create();
const rayNear = vec3.create();
const rayFar = vec3.create();
const rayDir = vec3.create();
const planeNormal = vec3.create();
const toPlane = vec3.create();
const inputPos = vec3.create();
const grabPoint = vec3.create();
const grabOffset = vec3.create();
const dragPos = vec3.create();
const bodyRot = quat.create();
const localAnchor = vec3.create();

let lastWorld = null;
let wasGrabbing = false;

let hand = null;
let joint = null;
let grabbedBody = null;

let grabbedSoftBody = null;
let grabbedParticles = [];

inInput.onChange = updateUi;
updateUi();

inFilter.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inFilter.get() });
};

inActive.onChange = () =>
{
    if (!inActive.get()) releaseLastWorldGrab();
};

exec.onTriggered = () =>
{
    const world = op.patch.frameStore.rapier?.world;
    if (!world || !inActive.get())
    {
        wasGrabbing = inGrab.get();
        next.trigger();
        return;
    }

    if (world != lastWorld)
    {
        forgetGrab();
        lastWorld = world;
    }

    const screenInput = inInput.get() == "Screen";
    if (screenInput) calcMouseRay();
    else vec3.set(inputPos, inPosX.get(), inPosY.get(), inPosZ.get());

    const grabbing = inGrab.get();
    if (grabbing && !wasGrabbing)
    {
        const collider = screenInput ? pickByRay(world) : pickByPosition(world);
        if (collider && isGrabbable(collider)) grabCollider(world, collider);
    }
    if (!grabbing && isGrabbing()) releaseGrab(world);
    wasGrabbing = grabbing;

    if (isGrabbing() && calcDragPos(screenInput))
    {
        moveGrab();
        outX.set(dragPos[0]);
        outY.set(dragPos[1]);
        outZ.set(dragPos[2]);
    }

    next.trigger();
};

function updateUi()
{
    const screenInput = inInput.get() == "Screen";
    inScreenX.setUiAttribs({ "greyout": !screenInput });
    inScreenY.setUiAttribs({ "greyout": !screenInput });
    inPosX.setUiAttribs({ "greyout": screenInput });
    inPosY.setUiAttribs({ "greyout": screenInput });
    inPosZ.setUiAttribs({ "greyout": screenInput });
    inReach.setUiAttribs({ "greyout": screenInput });
}

function isGrabbing()
{
    return !!(joint || grabbedSoftBody);
}

function softBodyHandleOf(collider)
{
    const handle = collider.softBody();
    if (handle !== null && handle !== undefined) return handle;

    const parent = collider.parent();
    if (parent && parent.isSoftFrame()) return parent.softBody();
    return null;
}

function bodyName(collider)
{
    const softHandle = softBodyHandleOf(collider);
    if (softHandle !== null && softHandle !== undefined) return lastWorld.getSoftBody(softHandle)?.userData?.name || "";

    return collider.parent()?.userData?.name || "";
}

function isGrabbable(collider)
{
    const softHandle = softBodyHandleOf(collider);
    const parent = collider.parent();
    const movable = (softHandle !== null && softHandle !== undefined) || !!(parent && parent.isDynamic());
    if (!movable) return false;

    const filter = inFilter.get();
    return !filter || bodyName(collider).includes(filter);
}

function calcMouseRay()
{
    mat4.mul(invViewProj, cgl.pMatrix, cgl.vMatrix);
    mat4.invert(invViewProj, invViewProj);

    vec3.set(rayNear, inScreenX.get(), inScreenY.get(), -1);
    vec3.set(rayFar, inScreenX.get(), inScreenY.get(), 1);
    vec3.transformMat4(rayNear, rayNear, invViewProj);
    vec3.transformMat4(rayFar, rayFar, invViewProj);

    vec3.sub(rayDir, rayFar, rayNear);
    vec3.normalize(rayDir, rayDir);
}

function pickByRay(world)
{
    const ray = new RAPIER.Ray(
        { "x": rayNear[0], "y": rayNear[1], "z": rayNear[2] },
        { "x": rayDir[0], "y": rayDir[1], "z": rayDir[2] });
    const hit = world.castRay(ray, RAY_MAX_DISTANCE, true);
    if (!hit) return null;

    vec3.scaleAndAdd(grabPoint, rayNear, rayDir, hit.timeOfImpact);

    mat4.invert(invView, cgl.vMatrix);
    vec3.set(planeNormal, -invView[8], -invView[9], -invView[10]);
    vec3.normalize(planeNormal, planeNormal);

    return hit.collider;
}

function pickByPosition(world)
{
    const projection = world.projectPoint({ "x": inputPos[0], "y": inputPos[1], "z": inputPos[2] }, true, undefined, undefined, undefined, undefined, isGrabbable);
    if (!projection) return null;

    if (projection.isInside) vec3.copy(grabPoint, inputPos);
    else vec3.set(grabPoint, projection.point.x, projection.point.y, projection.point.z);

    if (vec3.distance(grabPoint, inputPos) > inReach.get()) return null;

    vec3.sub(grabOffset, grabPoint, inputPos);
    return projection.collider;
}

function grabCollider(world, collider)
{
    const softHandle = softBodyHandleOf(collider);
    const parent = collider.parent();

    if (softHandle !== null && softHandle !== undefined) grabSoftBody(world.getSoftBody(softHandle));
    else if (parent && parent.isDynamic()) grabRigidBody(world, parent);

    if (isGrabbing()) outGrabbing.set(true);
}

function grabSoftBody(softBody)
{
    const radius = inSoftRadius.get();
    const particles = softBody.particlePositions();

    for (let i = 0; i < particles.length / 3; i++)
    {
        const dx = particles[i * 3] - grabPoint[0], dy = particles[i * 3 + 1] - grabPoint[1], dz = particles[i * 3 + 2] - grabPoint[2];
        if (dx * dx + dy * dy + dz * dz > radius * radius) continue;

        grabbedParticles.push({ "particle": i, "offset": [dx, dy, dz] });
        softBody.setParticlePinned(i, true);
    }

    if (grabbedParticles.length == 0) return;

    grabbedSoftBody = softBody;
    outName.set(softBody.userData?.name || "");
}

function grabRigidBody(world, body)
{
    const t = body.translation();
    const r = body.rotation();

    quat.set(bodyRot, r.x, r.y, r.z, r.w);
    quat.invert(bodyRot, bodyRot);
    vec3.set(localAnchor, grabPoint[0] - t.x, grabPoint[1] - t.y, grabPoint[2] - t.z);
    vec3.transformQuat(localAnchor, localAnchor, bodyRot);

    hand = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(grabPoint[0], grabPoint[1], grabPoint[2]));

    const mass = body.mass();
    const params = RAPIER.JointData.spring(0, inStiffness.get() * mass, inDamping.get() * mass,
        { "x": 0, "y": 0, "z": 0 },
        { "x": localAnchor[0], "y": localAnchor[1], "z": localAnchor[2] });

    joint = world.createImpulseJoint(params, hand, body, true);
    grabbedBody = body;
    outName.set(body.userData?.name || "");
}

function calcDragPos(screenInput)
{
    if (!screenInput)
    {
        vec3.add(dragPos, inputPos, grabOffset);
        return true;
    }

    const denom = vec3.dot(rayDir, planeNormal);
    if (Math.abs(denom) < PARALLEL_EPSILON) return false;

    vec3.sub(toPlane, grabPoint, rayNear);
    const t = vec3.dot(toPlane, planeNormal) / denom;
    if (t < 0) return false;

    vec3.scaleAndAdd(dragPos, rayNear, rayDir, t);
    return true;
}

function moveGrab()
{
    if (joint)
    {
        hand.setNextKinematicTranslation({ "x": dragPos[0], "y": dragPos[1], "z": dragPos[2] });
        grabbedBody.wakeUp();
    }

    if (grabbedSoftBody && grabbedSoftBody.isValid())
    {
        for (let i = 0; i < grabbedParticles.length; i++)
        {
            const g = grabbedParticles[i];
            grabbedSoftBody.setParticleKinematicTarget(g.particle, {
                "x": dragPos[0] + g.offset[0],
                "y": dragPos[1] + g.offset[1],
                "z": dragPos[2] + g.offset[2]
            });
        }
        grabbedSoftBody.wakeUp();
    }
}

function releaseGrab(world)
{
    if (joint)
    {
        world.removeImpulseJoint(joint, true);
        world.removeRigidBody(hand);
    }

    if (grabbedSoftBody && grabbedSoftBody.isValid())
        for (let i = 0; i < grabbedParticles.length; i++) grabbedSoftBody.setParticlePinned(grabbedParticles[i].particle, false);

    forgetGrab();
}

function releaseLastWorldGrab()
{
    if (!lastWorld || !isGrabbing()) return;

    try
    {
        releaseGrab(lastWorld);
    }
    catch (e)
    {
        op.logWarn("could not release grab, world was probably reset", e.message);
        forgetGrab();
    }
}

function forgetGrab()
{
    hand = null;
    joint = null;
    grabbedBody = null;
    grabbedSoftBody = null;
    grabbedParticles = [];
    vec3.set(grabOffset, 0, 0, 0);
    outGrabbing.set(false);
    outName.set("");
}

op.onDelete = releaseLastWorldGrab;
