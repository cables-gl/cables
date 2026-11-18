const
    exec = op.inTrigger("Trigger"),
    inBodies = op.inArray("Chassis Body"),

    inSteer = op.inFloat("Steering", 0),
    inThrottle = op.inFloat("Throttle", 0),
    inBrake = op.inFloat("Brake", 0),
    inMaxSteer = op.inFloat("Max Steering Angle", 30),
    inEngineForce = op.inFloat("Engine Force", 30),
    inBrakeForce = op.inFloat("Brake Force", 1),
    inDrive = op.inSwitch("Drive", ["Front", "Rear", "All"], "Rear"),

    inTrackX = op.inFloat("Half Track Width", 0.8),
    inFrontZ = op.inFloat("Front Axle Z", 1),
    inRearZ = op.inFloat("Rear Axle Z", -1),
    inWheelY = op.inFloat("Wheel Y", 0),
    inRadius = op.inFloat("Wheel Radius", 0.35),
    inWheelWidth = op.inFloat("Wheel Width", 0.3),

    inRestLength = op.inFloat("Suspension Rest Length", 0.3),
    inMaxTravel = op.inFloat("Max Suspension Travel", 0.3),
    inStiffness = op.inFloat("Suspension Stiffness", 30),
    inCompression = op.inFloat("Suspension Compression", 0.8),
    inRelaxation = op.inFloat("Suspension Relaxation", 1.2),
    inFrictionSlip = op.inFloat("Friction Slip", 2),
    inSideFriction = op.inFloat("Side Friction Stiffness", 1),

    inReset = op.inTriggerButton("Reset"),

    next = op.outTrigger("Next"),
    outSpeed = op.outNumber("Speed"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z"),
    outHeading = op.outNumber("Heading"),
    outGrounded = op.outNumber("Wheels On Ground"),
    outWheelPos = op.outArray("Wheel Positions", [], 3),
    outWheelRot = op.outArray("Wheel Rotations", [], 4),
    outWheelScale = op.outArray("Wheel Scalings", [], 3);

op.setPortGroup("Controls", [inSteer, inThrottle, inBrake, inMaxSteer, inEngineForce, inBrakeForce, inDrive]);
op.setPortGroup("Wheels", [inTrackX, inFrontZ, inRearZ, inWheelY, inRadius, inWheelWidth]);
inWheelWidth.setUiAttribs({ "title": "Wheel Width (visual only)" });
op.setPortGroup("Suspension", [inRestLength, inMaxTravel, inStiffness, inCompression, inRelaxation, inFrictionSlip, inSideFriction]);

const NUM_WHEELS = 4;
const DIR = { "x": 0, "y": -1, "z": 0 };
const AXLE = { "x": -1, "y": 0, "z": 0 };

let vehicle = null;
let world = null;
let chassis = null;
let needsSetup = true;

const wheelPos = new Float32Array(NUM_WHEELS * 3);
const wheelRot = new Float32Array(NUM_WHEELS * 4);
const wheelScale = new Float32Array(NUM_WHEELS * 3);
const chassisRot = quat.create();
const prevPos = vec3.create();
const prevRot = quat.create();
let hasPrev = false;
const wheelQuat = quat.create();
const v = vec3.create();

inTrackX.onChange =
    inFrontZ.onChange =
    inRearZ.onChange =
    inWheelY.onChange =
    inReset.onTriggered = () => { needsSetup = true; };

op.onDelete = remove;

function remove()
{
    if (world && vehicle) world.removeVehicleController(vehicle);
    vehicle = null;
    needsSetup = true;
}

function wheelOffsets()
{
    const x = inTrackX.get(),
        y = inWheelY.get(),
        f = inFrontZ.get(),
        r = inRearZ.get();
    return [
        { "x": x, "y": y, "z": f },
        { "x": -x, "y": y, "z": f },
        { "x": x, "y": y, "z": r },
        { "x": -x, "y": y, "z": r }];
}

function setup()
{
    remove();
    vehicle = world.createVehicleController(chassis);
    hasPrev = false;
    vehicle.setIndexForwardAxis = 2;

    const offs = wheelOffsets();
    for (let i = 0; i < NUM_WHEELS; i++) vehicle.addWheel(offs[i], DIR, AXLE, inRestLength.get(), inRadius.get());
    needsSetup = false;
}

function updateWheelParams()
{
    for (let i = 0; i < NUM_WHEELS; i++)
    {
        vehicle.setWheelRadius(i, inRadius.get());
        vehicle.setWheelSuspensionRestLength(i, inRestLength.get());
        vehicle.setWheelMaxSuspensionTravel(i, inMaxTravel.get());
        vehicle.setWheelSuspensionStiffness(i, inStiffness.get());
        vehicle.setWheelSuspensionCompression(i, inCompression.get());
        vehicle.setWheelSuspensionRelaxation(i, inRelaxation.get());
        vehicle.setWheelFrictionSlip(i, inFrictionSlip.get());
        vehicle.setWheelSideFrictionStiffness(i, inSideFriction.get());
    }
}

function updateControls()
{
    // positive steering turns right
    const steer = -Math.max(-1, Math.min(1, inSteer.get())) * inMaxSteer.get() * CGL.DEG2RAD;
    const force = Math.max(-1, Math.min(1, inThrottle.get())) * inEngineForce.get();
    const brake = Math.max(0, inBrake.get()) * inBrakeForce.get();
    const drive = inDrive.get();

    for (let i = 0; i < NUM_WHEELS; i++)
    {
        const front = i < 2;
        const driven = drive == "All" || (front ? drive == "Front" : drive == "Rear");
        vehicle.setWheelSteering(i, front ? steer : 0);
        vehicle.setWheelEngineForce(i, driven ? force : 0);
        vehicle.setWheelBrake(i, brake);
    }
}

function preStep(dt)
{
    if (!vehicle) return;
    if (world.getRigidBody(chassis.handle) != chassis) return; // chassis body was removed since the last frame

    // remember the chassis pose before each physics step, to interpolate between the last two steps
    const p = chassis.translation();
    const r = chassis.rotation();
    vec3.set(prevPos, p.x, p.y, p.z);
    quat.set(prevRot, r.x, r.y, r.z, r.w);
    hasPrev = true;

    if (inThrottle.get() != 0) chassis.wakeUp();
    vehicle.updateVehicle(dt);
}

function updateOutputs(alpha)
{
    const t = chassis.translation();
    const r = chassis.rotation();
    const p = { "x": t.x, "y": t.y, "z": t.z };
    quat.set(chassisRot, r.x, r.y, r.z, r.w);

    if (hasPrev && alpha < 1)
    {
        p.x = prevPos[0] + (p.x - prevPos[0]) * alpha;
        p.y = prevPos[1] + (p.y - prevPos[1]) * alpha;
        p.z = prevPos[2] + (p.z - prevPos[2]) * alpha;
        quat.slerp(chassisRot, prevRot, chassisRot, alpha);
    }

    outX.set(p.x);
    outY.set(p.y);
    outZ.set(p.z);
    vec3.transformQuat(v, [0, 0, 1], chassisRot);
    outHeading.set(Math.atan2(v[0], v[2]) * CGL.RAD2DEG);
    outSpeed.set(vehicle.currentVehicleSpeed());

    let grounded = 0;
    for (let i = 0; i < NUM_WHEELS; i++)
    {
        if (vehicle.wheelIsInContact(i)) grounded++;

        const c = vehicle.wheelChassisConnectionPointCs(i);
        const len = vehicle.wheelSuspensionLength(i) || inRestLength.get();
        vec3.set(v, c.x + DIR.x * len, c.y + DIR.y * len, c.z + DIR.z * len);
        vec3.transformQuat(v, v, chassisRot);
        wheelPos[i * 3] = v[0] + p.x;
        wheelPos[i * 3 + 1] = v[1] + p.y;
        wheelPos[i * 3 + 2] = v[2] + p.z;

        quat.rotateY(wheelQuat, chassisRot, vehicle.wheelSteering(i));
        quat.rotateX(wheelQuat, wheelQuat, vehicle.wheelRotation(i));
        wheelRot.set(wheelQuat, i * 4);

        // for a unit wheel mesh: radius 1, width 1, axle along x
        wheelScale[i * 3] = inWheelWidth.get();
        wheelScale[i * 3 + 1] = wheelScale[i * 3 + 2] = vehicle.wheelRadius(i);
    }

    outGrounded.set(grounded);
    outWheelPos.setRef(wheelPos);
    outWheelRot.setRef(wheelRot);
    outWheelScale.setRef(wheelScale);
}

exec.onTriggered = () =>
{
    const rapier = op.patch.frameStore.rapier;
    const bodies = inBodies.get();
    const body = bodies && bodies[0];

    if (!rapier?.preStep || !body)
    {
        op.setUiError("nobody", "Needs to be below a Rapier World_v3", 1);
        next.trigger();
        return;
    }
    op.setUiError("nobody", null);

    if (rapier.world != world || body != chassis)
    {
        if (rapier.world != world) vehicle = null;
        world = rapier.world;
        chassis = body;
        needsSetup = true;
    }

    if (needsSetup) setup();

    updateWheelParams();
    updateControls();
    rapier.preStep.push(preStep);
    updateOutputs(rapier.alpha ?? 1);

    next.trigger();
};
