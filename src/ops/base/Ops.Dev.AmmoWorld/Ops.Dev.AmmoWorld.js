const
    inExec = op.inTrigger("Update"),
    next = op.outTrigger("next"),
    outNumBodies=op.outNumber("Total Bodies");

inExec.onTriggered = update;

const cgl=op.patch.cgl;
let deltaTime, lastTime;
let ammoWorld = new CABLES.AmmoWorld();

function update()
{

    if(!ammoWorld || !ammoWorld.world)return;
    deltaTime = performance.now() - lastTime;
    ammoWorld.frame();

    const old = cgl.frameStore.ammoWorld;
    cgl.frameStore.ammoWorld=ammoWorld;

    ammoWorld.renderDebug();

    next.trigger();

    lastTime = performance.now();
    cgl.frameStore.ammoWorld = old;


outNumBodies.set(ammoWorld.numBodies())
}
