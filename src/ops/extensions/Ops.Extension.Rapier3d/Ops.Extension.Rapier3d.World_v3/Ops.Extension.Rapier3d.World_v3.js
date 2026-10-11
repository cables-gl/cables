const gravity = { "x": 0.0, "y": -9.81, "z": 0.0 };

const
    exec = op.inTrigger("Execute"),
    inDebug = op.inBool("Debug", true),
    inRenderDebug = op.inBool("Render Debug", false),
    inDebugOpacity = op.inFloatSlider("Debug Opacity", 1),

    inGravX = op.inFloat("Gravity X", gravity.x),
    inGravY = op.inFloat("Gravity Y", gravity.y),
    inGravZ = op.inFloat("Gravity Z", gravity.z),

    inStepsPerSecond = op.inInt("Steps Per Second", 60),
    inMaxSteps = op.inInt("Max Steps Per Frame", 4),
    inSpeed = op.inFloat("Speed", 1),
    inReset = op.inTriggerButton("Reset"),

    next = op.outTrigger("Next"),
    outSteps = op.outNumber("Steps This Frame"),
    outDebugPoints = op.outArray("Debug Splines"),
    outDebugColors = op.outArray("Debug Colors"),
    outVersion = op.outString("Version");

op.setPortGroup("Debug", [inDebug, inRenderDebug, inDebugOpacity]);
op.setPortGroup("Gravity", [inGravX, inGravY, inGravZ]);
op.setPortGroup("Simulation", [inStepsPerSecond, inMaxSteps, inSpeed, inReset]);

const cgl = op.patch.cgl;
let world = null;
let eventQueue = null;
let collisions = {};
let needsReset = true;
let lastTime = -1;
let accumulator = 0;

let debugShader = null;
let debugMesh = null;

inGravX.onChange =
    inGravY.onChange =
    inGravZ.onChange = updateGravity;

inReset.onTriggered = () => { needsReset = true; };

op.onDelete = () =>
{
    if (debugMesh) debugMesh.dispose();
};

wait();

function wait()
{
    if (!window.RAPIER) setTimeout(wait, 100);
    else init();
}

async function init()
{
    if (!CABLES.rapierInited)
    {
        const loadingId = op.patch.loading.start(op.objName, "rapierlib", op);

        CABLES.rapierInited = 1;
        await RAPIER.init();
        CABLES.rapierInited = 2;

        op.patch.loading.finished(loadingId);
    }
}

function updateGravity()
{
    gravity.x = inGravX.get();
    gravity.y = inGravY.get();
    gravity.z = inGravZ.get();
    if (world) world.gravity = { "x": gravity.x, "y": gravity.y, "z": gravity.z };
}

function resetWorld()
{
    if (world) world.free();

    updateGravity();
    world = new RAPIER.World({ "x": gravity.x, "y": gravity.y, "z": gravity.z });
    eventQueue = new RAPIER.EventQueue(true);
    outVersion.set(RAPIER.version());
    collisions = {};
    accumulator = 0;
    lastTime = -1;
    needsReset = false;
}

function getNumSteps()
{
    const now = op.patch.freeTimer.get();
    let delta = lastTime < 0 ? 0 : now - lastTime;
    lastTime = now;
    if (delta < 0) delta = 0;

    const stepDuration = 1 / Math.max(1, inStepsPerSecond.get());
    const maxSteps = Math.max(1, inMaxSteps.get());

    accumulator += delta * Math.max(0, inSpeed.get());
    if (accumulator > stepDuration * maxSteps) accumulator = stepDuration * maxSteps;

    let steps = 0;
    while (accumulator >= stepDuration && steps < maxSteps)
    {
        accumulator -= stepDuration;
        steps++;
    }

    world.timestep = stepDuration;
    return steps;
}

function drainEvents()
{
    eventQueue.drainCollisionEvents((handle1, handle2, started) =>
    {
        const id = Math.min(handle1, handle2) + "_" + Math.max(handle1, handle2);
        if (started) collisions[id] = { "handle1": handle1, "handle2": handle2, "started": started };
        else delete collisions[id];
    });
}

exec.onTriggered = () =>
{
    if (needsReset && window.RAPIER && CABLES.rapierInited == 2 && window.RAPIER.IntegrationParameters) resetWorld();
    if (!world) return;

    const steps = getNumSteps();
    try
    {
        for (let i = 0; i < steps; i++)
        {
            world.step(eventQueue);
            drainEvents();
        }
    }
    catch (e)
    {
        op.logError(e);
    }
    outSteps.set(steps);

    let dbg = null;
    if (inRenderDebug.get() || (inDebug.get() && outDebugPoints.isLinked())) dbg = world.debugRender();

    if (dbg && inDebug.get() && outDebugPoints.isLinked())
    {
        outDebugPoints.set(dbg.vertices);
        outDebugColors.set(dbg.colors);
    }

    const oldRapier = op.patch.frameStore.rapier;
    op.patch.frameStore.rapier = {
        "ignoreEventHandles": [],
        "collisionEvents": collisions,
        "world": world,
        "eventQueue": eventQueue,
        "tools": RapierTools
    };

    next.trigger();

    if (dbg && inRenderDebug.get()) renderDebugLines(dbg);

    op.patch.frameStore.rapier = oldRapier;
};

function renderDebugLines(dbg)
{
    if (!debugShader)
    {
        debugShader = new CGL.Shader(cgl, op.name + " debug lines");
        debugShader.setSource(attachments.debuglines_vert, attachments.debuglines_frag);
        new CGL.Uniform(debugShader, "f", "opacity", inDebugOpacity);
        debugMesh = new CGL.Mesh(cgl, new CGL.Geometry(op.name + " debug lines"), { "glPrimitive": cgl.gl.LINES });
    }

    if (dbg.vertices.length == 0) return;

    debugMesh.updateVertices(dbg);
    debugMesh.setAttribute("attrVertColor", dbg.colors, 4);

    cgl.pushModelMatrix();
    mat4.identity(cgl.mMatrix);
    cgl.pushDepthTest(false);
    cgl.pushBlend(true);
    cgl.pushShader(debugShader);
    debugMesh.render(debugShader);
    cgl.popShader();
    cgl.popBlend();
    cgl.popDepthTest();
    cgl.popModelMatrix();
}
