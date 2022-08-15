const
    inExec=op.inTrigger("Exec"),
    inName=op.inString("Branch Name","default"),
    outNext=op.outTrigger("Next");

op.patch.cgl.frameStore.branchProfiler=op.patch.cgl.frameStore.branchProfiler||{};

const name="";
const bs=new CABLES.BranchStack();

inName.onChange=()=>
{


};


inExec.onTriggered=()=>
{
    op.patch.cgl.frameStore.branchStack=op.patch.cgl.frameStore.branchStack||new CABLES.BranchStack();

    op.patch.cgl.frameStore.branchStack.push(inName.get());

    outNext.trigger();

    op.patch.cgl.frameStore.branchStack.pop();

};