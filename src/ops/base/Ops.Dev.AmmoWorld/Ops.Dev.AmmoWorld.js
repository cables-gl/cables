const
    inExec = op.inTrigger("Update"),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("next"),
    outNumBodies = op.outNumber("Total Bodies");

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
    ammoWorld.frame();

    const old = cgl.frameStore.ammoWorld;
    cgl.frameStore.ammoWorld = ammoWorld;

    ammoWorld.renderDebug();

    next.trigger();

    lastTime = performance.now();
    cgl.frameStore.ammoWorld = old;

    outNumBodies.set(ammoWorld.numBodies());
}
