
var exe=op.inFunction("exec");
var next=op.outFunction("Next");


exe.onTriggered=function()
{
    if(!op.patch.cgl.frameStore.shadowPass)
    {
        next.trigger();
    }
};

