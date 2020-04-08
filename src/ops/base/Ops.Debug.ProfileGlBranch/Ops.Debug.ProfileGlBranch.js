const
    exe=op.inTrigger("Exec"),
    title=op.inString("Branch Name",""),
    next=op.outTrigger("Next");

CABLES.profilerBranches=[];
exe.onTriggered=exec;

function exec()
{
    CABLES.profilerBranches.push(title.get());
    next.trigger();
    CABLES.profilerBranches.pop();

}
