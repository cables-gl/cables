const
    exe=op.inTrigger("Exec"),
    title=op.inString("Branch Name",""),
    next=op.outTrigger("Next");

CABLES.profilerBranches=[];
CABLES.profilerBranchesTimes={};
exe.onTriggered=exec;


title.onChange=function()
{
    op.setUiAttrib({"extendTitle":title.get()});
};


function exec()
{
    if(op.patch.cgl.debugOneFrame)
    {
        CABLES.profilerBranches.push(title.get());

        const start=performance.now();
        next.trigger();

        const used=performance.now()-start;

        CABLES.profilerBranches.pop();

        const branchname=CABLES.profilerBranches.join(" / ");
        CABLES.profilerBranchesTimes[branchname]=CABLES.profilerBranchesTimes[branchname]||0;
        CABLES.profilerBranchesTimes[branchname]+=used;

    }
    else
    {
        next.trigger();
    }

}
