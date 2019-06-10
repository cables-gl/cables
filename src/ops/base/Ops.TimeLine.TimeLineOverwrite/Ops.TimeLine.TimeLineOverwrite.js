const exec=op.inTrigger("exe");
const newTime=op.inValueFloat("new time");
const next=op.outTrigger("trigger");

var realTime=0;
exec.onTriggered=function()
{
    realTime=op.patch.timer.getTime();

    op.patch.timer.overwriteTime=newTime.get();
    next.trigger();
    op.patch.timer.overwriteTime=-1;
};
