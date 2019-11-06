
var exe=op.inTrigger("exec");
var next=op.outTrigger("Next");

exe.onTriggered=function()
{
    if(!op.patch.cgl.frameStore.shadowPass)
    {
        next.trigger();
    }
};

