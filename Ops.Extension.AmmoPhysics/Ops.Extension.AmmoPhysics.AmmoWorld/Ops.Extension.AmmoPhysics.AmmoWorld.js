const
    inExec = op.inTrigger("Update"),
    inSim = op.inBool("Simulate", true),
    inAutoRemove = op.inBool("Auto Remove Inactive", true),

    inGravX = op.inFloat("Gravity X", 0),
    inGravY = op.inFloat("Gravity Y", -9.81),
    inGravZ = op.inFloat("Gravity Z", 0),

    inActivateAll = op.inTriggerButton("Activate All"),
    inReset = op.inTriggerButton("Reset"),

    next = op.outTrigger("next"),
    outNumBodies = op.outNumber("Total Bodies"),
    outPoints = op.outArray("debug points"),
    outBodiesMeta = op.outArray("Bodies Meta"),
    outCollisions = op.outArray("Collisions");

op.setPortGroup("Gravity", [inGravX, inGravZ, inGravY]);

inExec.onTriggered = update;

const cgl = op.patch.cgl;
let deltaTime, lastTime;
let ammoWorld = null;// new CABLES.AmmoWorld();
let loadingId = null;
let needsReset = true;
inReset.onTriggered = () =>
{
    needsReset = true;
};

inActivateAll.onTriggered = () =>
{
    if (ammoWorld) ammoWorld.activateAllBodies();
};

inGravX.onChange = inGravZ.onChange = inGravY.onChange = updateGravity;

function updateGravity()
{
    if (ammoWorld && ammoWorld.world)
        ammoWorld.world.setGravity(new Ammo.btVector3(inGravX.get(), inGravY.get(), inGravZ.get()));
}

function update()
{
    if (needsReset)
    {
        if (ammoWorld)ammoWorld.dispose();
        ammoWorld = null;
        needsReset = false;
    }

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
            if (!loadingId) loadingId = cgl.patch.loading.start("ammoWorld", "ammoWASM", op);
            return;
        }
    }
    if (!ammoWorld.world) return;

    deltaTime = performance.now() - lastTime;

    if (inSim.get()) ammoWorld.frame();

    const old = cgl.tempData.ammoWorld;
    cgl.tempData.ammoWorld = ammoWorld;

    outNumBodies.set(ammoWorld.numBodies());
    outBodiesMeta.set(ammoWorld.getListBodies());
    outCollisions.set(ammoWorld.getCollisions());

    ammoWorld.autoRemove = inAutoRemove.get();

    next.trigger();

    lastTime = performance.now();
    cgl.tempData.ammoWorld = old;
}
