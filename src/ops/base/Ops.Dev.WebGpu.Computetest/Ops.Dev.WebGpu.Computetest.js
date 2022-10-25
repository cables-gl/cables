const
    compute=op.inTrigger("Computer"),
    next=op.outTrigger("Next");

let comp=null;
compute.onTriggered=()=>
{
    if(!comp)
    {
        comp=new CABLES.CGP.GpuCompute(op.patch.cg,"c0mput",attachments.compute_wgsl);

        comp.compute();
    }

}