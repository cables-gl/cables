const cgl = op.patch.cgl;
const inTrigger = op.inTrigger("Trigger In");
const inBool = op.inBool("Reset Lights", true);
const outTrigger = op.outTrigger("Trigger Out");


inTrigger.onTriggered = () => {
    if (inBool.get()) {
        const oldStack = cgl.frameStore.lightStack;
        cgl.frameStore.lightStack = [];
        outTrigger.trigger();
        cgl.frameStore.lightStack = oldStack;
        return;
    }

    outTrigger.trigger();
}