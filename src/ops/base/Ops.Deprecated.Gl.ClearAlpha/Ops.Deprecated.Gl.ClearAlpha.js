const exec=op.inTrigger("render");
const next=op.outTrigger("trigger");

exec.onTriggered=function()
{
    next.trigger();

};