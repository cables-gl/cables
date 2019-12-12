const
    inExe=op.inTrigger("Update"),
    inMode=op.inSwitch("Position",['Relative','Absolute'],'Relative'),
    inEle=op.inObject("Element"),
    outX=op.outNumber("x"),
    outY=op.outNumber("y"),
    outWidth=op.outNumber("Width"),
    outHeight=op.outNumber("Height");

inMode.onChange=updateMode;
updateMode();

function updateMode()
{
    if(inMode.get()=="Relative")
    {
        inEle.onChange=updateRel;
        inExe.onTriggered=updateRel;
    }
    else
    {
        inEle.onChange=updateAbs;
        inExe.onTriggered=updateAbs;
    }
}

function updateAbs()
{
    const ele=inEle.get();
    if(!ele)return;

    const r=ele.getBoundingClientRect();

    outX.set(r.x);
    outY.set(r.y);
    outWidth.set(r.width);
    outHeight.set(r.height);
}

function updateRel()
{
    const ele=inEle.get();
    if(!ele)return;

    const rcanv=op.patch.cgl.canvas.getBoundingClientRect();
    const r=ele.getBoundingClientRect();
    outX.set(r.x-rcanv.x);
    outY.set(r.y-rcanv.y);
    outWidth.set(r.width);
    outHeight.set(r.height);
}