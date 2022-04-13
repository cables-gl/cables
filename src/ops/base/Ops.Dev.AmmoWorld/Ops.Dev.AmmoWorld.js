const
    inExec = op.inTrigger("Update"),
    inReset = op.inTriggerButton("Reset"),
    inSim = op.inBool("Simulate", true),

    inGravX = op.inFloat("Gravity X", 0),
    inGravY = op.inFloat("Gravity Y", -9),
    inGravZ = op.inFloat("Gravity Z", 0),

    inActivateAll = op.inTriggerButton("Activate All"),

    next = op.outTrigger("next"),
    outNumBodies = op.outNumber("Total Bodies"),
    outPoints = op.outArray("debug points");

op.setPortGroup("Gravity", [inGravX, inGravZ, inGravY]);

inExec.onTriggered = update;

const cgl = op.patch.cgl;
let deltaTime, lastTime;
let ammoWorld = null;// new CABLES.AmmoWorld();
let loadingId = null;

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
        if (Ammo.cablesSetupDone)
        {
            ammoWorld = new CABLES.AmmoWorld();
            updateGravity();
            cgl.patch.loading.finished(loadingId);
            loadingId = null;
        }
        else
        {
            if (!loadingId) loadingId = cgl.patch.loading.start("ammoWorld", "ammoWASM");
            return;
        }
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
}
