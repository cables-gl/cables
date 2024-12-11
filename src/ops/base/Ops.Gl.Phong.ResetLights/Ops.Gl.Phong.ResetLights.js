const cgl = op.patch.cgl;
const inTrigger = op.inTrigger("Trigger In");
const inBool = op.inBool("Reset Lights", true);
const outTrigger = op.outTrigger("Trigger Out");

inTrigger.onTriggered = () =>
{
    if (inBool.get())
    {
        const oldStack = cgl.tempData.lightStack;
        cgl.tempData.lightStack = [];
        outTrigger.trigger();
        cgl.tempData.lightStack = oldStack;
        return;
    }

    outTrigger.trigger();
};
