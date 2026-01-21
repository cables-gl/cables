const
    exec = op.inTrigger("Execute"),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outDebugPoints = op.outArray("Debug Splines"),
    outDebugColors = op.outArray("Debug Colors"),
    outVersion = op.outString("Version");

let rigidBody;
let world;
let eventQueue;
let collisions = {};

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
    let gravity = { "x": 0.0, "y": -9.81, "z": 0.0 };
    await RAPIER.init();

    world = new RAPIER.World(gravity);
    eventQueue = new RAPIER.EventQueue(true);

    outVersion.set(RAPIER.version());
    collisions = {};
}

exec.onTriggered = () =>
{
    if (!world) return;

    const oldWorld = op.patch.frameStore.rapierWorld;
    op.patch.frameStore.rapierWorld = world;
    op.patch.frameStore.rapierEventQueue = eventQueue; // todo: moved to rapier object

    world.step(eventQueue);

    const ray = new RAPIER.Ray(new RAPIER.Vector3(-0.5, 0, 0), new RAPIER.Vector3(1, 0, 0));
    const result = world.castRay(ray);

    const dbg = world.debugRender();
    outDebugPoints.set(dbg.vertices);
    outDebugColors.set(dbg.colors);
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
