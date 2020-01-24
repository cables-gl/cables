const
    inTrigger=op.inTrigger("Trigger"),
    inActive=op.inBool("Active",false),
    inWidth=op.inInt("Width",300),
    inHeight=op.inInt("Height",200),
    next=op.outTrigger("Next");

op.setPortGroup("Size",[inWidth,inHeight]);

inTrigger.onTriggered=function()
{
    if(inActive.get())
    {
        const w=inWidth.get();
        const h=inHeight.get();

        if(op.patch.cgl.canvas.width!=w || op.patch.cgl.canvas.height!=h)
        {
            op.patch.cgl.setSize(w,h);
        }
    }

    next.trigger();
};