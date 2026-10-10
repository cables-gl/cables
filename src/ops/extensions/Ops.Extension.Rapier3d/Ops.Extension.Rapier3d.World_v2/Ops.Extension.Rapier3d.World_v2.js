const gravity = { "x": 0.0, "y": -9.81, "z": 0.0 };

const
    exec = op.inTrigger("Execute"),
    inDebug = op.inBool("Debug", true),
    inRenderDebug = op.inBool("Render Debug", false),
    inDebugOpacity = op.inFloatSlider("Debug Opacity", 1),

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

op.setPortGroup("Debug", [inDebug, inRenderDebug, inDebugOpacity]);

const cgl = op.patch.cgl;
let debugShader = null;
let debugMesh = null;
let debugOpacityUniform = null;

function renderDebugLines(dbg)
{
    if (!debugShader)
    {
        debugShader = new CGL.Shader(cgl, op.name + " debug lines");
        debugShader.setSource(attachments.debuglines_vert, attachments.debuglines_frag);
        debugOpacityUniform = new CGL.Uniform(debugShader, "f", "opacity", inDebugOpacity);
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

op.onDelete = () =>
{
    if (debugMesh) debugMesh.dispose();
};

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
        await RAPIER.init();
        CABLES.rapierInited = 2;

        op.patch.loading.finished(loadingId);
    }
}

exec.onTriggered = () =>
{
    if (needsReset && window.RAPIER && CABLES.rapierInited == 2 && window.RAPIER.IntegrationParameters)
    {
        if (world) world.free();

        params = new RAPIER.IntegrationParameters();
        world = new RAPIER.World(gravity);
        eventQueue = new RAPIER.EventQueue(true);
        outVersion.set(RAPIER.version());
        collisions = {};
        needsReset = false;
    }

    if (!world) return;

    const oldRapier = op.patch.frameStore.rapier;
    // op.patch.frameStore.rapierWorld = world;
    // op.patch.frameStore.rapierEventQueue = eventQueue; // todo: moved to rapier object
    try
    {
        for (let i = 0; i < inTimes.get(); i++)
        {
            if (world) world.step(eventQueue);
        }

    }
    catch (e)
    {
        console.log("e", e, world);
    }

    // const ray = new RAPIER.Ray(new RAPIER.Vector3(-0.5, 0, 0), new RAPIER.Vector3(1, 0, 0));
    // const result = world.castRay(ray);

    let dbg = null;
    if (inRenderDebug.get() || (inDebug.get() && outDebugPoints.isLinked())) dbg = world.debugRender();

    if (dbg && inDebug.get() && outDebugPoints.isLinked())
    {
        outDebugPoints.set(dbg.vertices);
        outDebugColors.set(dbg.colors);
    }

    eventQueue.drainCollisionEvents((handle1, handle2, started) =>
    {
        const id = Math.min(handle1, handle2) + "_" + Math.max(handle2, handle1);

        // op.patch.frameStore.rapier.ignoreEventHandles;
        // if (!op.patch.frameStore.rapier.ignoreEventHandles.includes(handle1) &&
        // !op.patch.frameStore.rapier.ignoreEventHandles.includes(handle2))
        // {
        collisions[id] = { "handle1": handle1, "handle2": handle2, "started": started };
        // }

        if (!started) delete collisions[id];
    });

    op.patch.frameStore.rapier = {
        "ignoreEventHandles": [],
        "collisionEvents": collisions,
        "world": world,
        "eventQueue": eventQueue
    };

    next.trigger();

    if (dbg && inRenderDebug.get()) renderDebugLines(dbg);

    op.patch.frameStore.rapier = oldRapier;
};
