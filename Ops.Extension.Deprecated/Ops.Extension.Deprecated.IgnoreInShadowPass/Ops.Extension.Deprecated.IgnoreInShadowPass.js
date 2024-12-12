let exe = op.inTrigger("exec");
let next = op.outTrigger("Next");

exe.onTriggered = function ()
{
    if (!op.patch.cglframeStoreshadowPass)
    {
        next.trigger();
    }
};
