const
    exe=op.inTrigger("Execute"),
    num=op.inValueInt("Repeats",5),
    dir=op.inSwitch("Direction",['Forward','Backward'],'Forward'),
    next=op.outTrigger("Next"),
    idx=op.addOutPort(new CABLES.Port(op,"index"));

dir.onChange=updateDir;
updateDir();

function updateDir()
{
    if(dir.get()=="Forward") exe.onTriggered=forward;
    else exe.onTriggered=backward;
}

function forward()
{
    const max=Math.floor(num.get());

    for(var i=0;i<max;i++)
    {
        idx.set(i);
        next.trigger();
    }
}

function backward()
{
    const numi=Math.floor(num.get());
    for(var i=numi-1;i>-1;i--)
    {
        idx.set(i);
        next.trigger();
    }
}
