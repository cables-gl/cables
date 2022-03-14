const
    inExec = op.inTrigger("Update"),
    inReset = op.inTriggerButton("Reset"),
    inSim = op.inBool("Simulate", true),

    inDrawWireframe = op.inBool("Draw Wireframe", true),
    inDrawAABB = op.inBool("Draw AABB", true),

    next = op.outTrigger("next"),
    outNumBodies = op.outNumber("Total Bodies"),
    outPoints = op.outArray("debug points");

inExec.onTriggered = update;

const cgl = op.patch.cgl;
let deltaTime, lastTime;
let ammoWorld = new CABLES.AmmoWorld();

inReset.onTriggered = () =>
{
    if (ammoWorld)ammoWorld.dispose();
    ammoWorld = null;
};

function update()
{
    if (!ammoWorld) ammoWorld = new CABLES.AmmoWorld();
    if (!ammoWorld.world) return;
    deltaTime = performance.now() - lastTime;

    if (inSim.get()) ammoWorld.frame();

    const old = cgl.frameStore.ammoWorld;
    cgl.frameStore.ammoWorld = ammoWorld;

    outNumBodies.set(ammoWorld.numBodies());

    next.trigger();

    lastTime = performance.now();
    cgl.frameStore.ammoWorld = old;

    let debugmode = 0;
    if (inDrawWireframe.get())debugmode |= 1;
    if (inDrawAABB.get())debugmode |= 2;

    console.log(debugmode);

    if (debugmode)
    {
        cgl.pushDepthTest(false);
        cgl.pushDepthWrite(false);

        ammoWorld.renderDebug(cgl);

        outPoints.set(ammoWorld.debugDrawer.verts);

        cgl.popDepthTest();
        cgl.popDepthWrite();
    }
}
