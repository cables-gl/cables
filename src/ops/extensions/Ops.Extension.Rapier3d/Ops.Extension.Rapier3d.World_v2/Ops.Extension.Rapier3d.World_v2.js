const gravity = { "x": 0.0, "y": -9.81, "z": 0.0 };

const
    exec = op.inTrigger("Execute"),
    inDebug = op.inBool("Debug", true),

    inGravX = op.inFloat("Gravity X", gravity.x),
    inGravY = op.inFloat("Gravity Y", gravity.y),
    inGravZ = op.inFloat("Gravity Z", gravity.z),

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
let params = null;
let needsReset = true;

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

inReset.onTriggered = () => { needsReset = true; };

async function init()
{
    if (!CABLES.rapierInited)
    {
        const loadingId = op.patch.loading.start(op.objName, "rapierlib", op);

        CABLES.rapierInited = 1;
        console.log("init rapier.......");
        await RAPIER.init();
        CABLES.rapierInited = 2;

        op.patch.loading.finished(loadingId);
    }
}

exec.onTriggered = () =>
{
    if (needsReset && window.RAPIER && CABLES.rapierInited == 2 && window.RAPIER.IntegrationParameters)
    {
        if (world)world.free();

        params = new RAPIER.IntegrationParameters();
        world = new RAPIER.World(gravity);
        eventQueue = new RAPIER.EventQueue(true);
        outVersion.set(RAPIER.version());
        collisions = {};
        needsReset = false;
    }

    if (!world) return;

    const oldWorld = op.patch.frameStore.rapierWorld;
    op.patch.frameStore.rapierWorld = world;
    op.patch.frameStore.rapierEventQueue = eventQueue; // todo: moved to rapier object

    for (let i = 0; i < inTimes.get(); i++)
    {
        if (world)

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
