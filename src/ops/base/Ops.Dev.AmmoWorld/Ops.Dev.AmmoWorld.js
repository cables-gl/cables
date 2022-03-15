const
    inExec = op.inTrigger("Update"),
    inReset = op.inTriggerButton("Reset"),
    inSim = op.inBool("Simulate", true),

    inGravX = op.inFloat("Gravity X", 0),
    inGravY = op.inFloat("Gravity Y", -9),
    inGravZ = op.inFloat("Gravity Z", 0),

    inDrawWireframe = op.inBool("Draw Wireframe", true),
    inDrawAABB = op.inBool("Draw AABB", false),
    inDrawContacts = op.inBool("Draw Contact Points", false),
    inIgnClear = op.inBool("Depth", true),

    inActivateAll = op.inTriggerButton("Activate All"),

    next = op.outTrigger("next"),
    outNumBodies = op.outNumber("Total Bodies"),
    outPoints = op.outArray("debug points");

op.setPortGroup("Gravity", [inGravX, inGravZ, inGravY]);
op.setPortGroup("Debug Renderer", [inDrawWireframe, inDrawAABB, inIgnClear, inDrawContacts]);

inExec.onTriggered = update;

const cgl = op.patch.cgl;
let deltaTime, lastTime;
let ammoWorld = null;// new CABLES.AmmoWorld();

inReset.onTriggered = () =>
{
    if (ammoWorld)ammoWorld.dispose();
    ammoWorld = null;
};

inActivateAll.onTriggered = () =>
{
    ammoWorld.activateAllBodies();
};

inGravX.onChange = inGravZ.onChange = inGravY.onChange = updateGravity;

function updateGravity()
{
    if (ammoWorld && ammoWorld.world)
        ammoWorld.world.setGravity(new Ammo.btVector3(inGravX.get(), inGravY.get(), inGravZ.get()));
}

function update()
{
    if (!ammoWorld)
    {
        ammoWorld = new CABLES.AmmoWorld();
        updateGravity();
    }
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
    if (inDrawContacts.get())debugmode |= 8;

    debugmode |= 16384;

    if (debugmode)
    {
        cgl.pushModelMatrix();
        cgl.pushDepthTest(inIgnClear.get());
        cgl.pushDepthWrite(inIgnClear.get());

        mat4.identity(cgl.mMatrix);

        ammoWorld.renderDebug(cgl);
        ammoWorld.debugDrawer.setDebugMode(debugmode);
        outPoints.set(ammoWorld.debugDrawer.verts);

        cgl.popDepthTest();
        cgl.popDepthWrite();
        cgl.popModelMatrix();
    }
}
