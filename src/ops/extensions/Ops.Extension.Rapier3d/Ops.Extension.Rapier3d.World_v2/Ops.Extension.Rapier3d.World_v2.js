const
    exec = op.inTrigger("Execute"),
    inDebug = op.inBool("Debug", true),

    inGravX = op.inFloat("Gravity X", 0),
    inGravY = op.inFloat("Gravity Y", -9.81),
    inGravZ = op.inFloat("Gravity Z", 0),

    inTimes = op.inInt("Simulate times", 1),
    inReset = op.inTriggerButton("Reset"),

    next = op.outTrigger("Next"),
    outDebugPoints = op.outArray("Debug Splines"),
    outDebugColors = op.outArray("Debug Colors"),
    outVersion = op.outString("Version");

let rigidBody;
let world;
let eventQueue;
let collisions = {};
let gravity = { "x": 0.0, "y": 0.0, "z": 0.0 };
let params = null;

inGravX.onChange =
inGravY.onChange =
inGravZ.onChange = () =>
{
    gravity.x = inGravX.get();
    gravity.y = inGravY.get();
    gravity.z = inGravZ.get();
};

wait();

function wait()
{
    if (!window.RAPIER)
    {
        console.log("waiting for rapier...");
        setTimeout(wait, 100);
    }
    else init();
}

inReset.onTriggered = init;

async function init()
{
    if (world)world.free();
    await RAPIER.init();

    params = new RAPIER.IntegrationParameters();

    world = new RAPIER.World(gravity);
    eventQueue = new RAPIER.EventQueue(true);

    outVersion.set(RAPIER.version());

    // console.log(world.step.toString());

    collisions = {};
}

exec.onTriggered = () =>
{
    if (!world) return;

    const oldWorld = op.patch.frameStore.rapierWorld;
    op.patch.frameStore.rapierWorld = world;
    op.patch.frameStore.rapierEventQueue = eventQueue; // todo: moved to rapier object

    // console.log("params", params);

    for (let i = 0; i < inTimes.get(); i++)
    {
        world.step();
    }

    const ray = new RAPIER.Ray(new RAPIER.Vector3(-0.5, 0, 0), new RAPIER.Vector3(1, 0, 0));
    const result = world.castRay(ray);

    if (inDebug.get() && outDebugPoints.isLinked())
    {
        const dbg = world.debugRender();
        outDebugPoints.set(dbg.vertices);
        outDebugColors.set(dbg.colors);
    }

    eventQueue.drainCollisionEvents((handle1, handle2, started) =>
    {
        const id = Math.min(handle1, handle2) + "_" + Math.max(handle2, handle1);

        op.patch.frameStore.rapier.ignoreEventHandles;
        if (
            !op.patch.frameStore.rapier.ignoreEventHandles.includes(handle1) &&
            !op.patch.frameStore.rapier.ignoreEventHandles.includes(handle2))
            collisions[id] = { "handle1": handle1, "handle2": handle2, "started": started };

        if (!started) delete collisions[id];
    });

    op.patch.frameStore.rapier =
    {
        "ignoreEventHandles": [],
        "collisionEvents": collisions,
        "world": world,
        "eventQueue": eventQueue
    };

    next.trigger();

    op.patch.frameStore.rapierWorld = oldWorld;
};
