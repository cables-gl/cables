const
    inUpd=op.inTriggerButton("Update"),
    inEle=op.inObject("Element",null,"element"),
    outWidth=op.outNumber("Width"),
    outHeight=op.outNumber("Height"),
    outX=op.outNumber("X"),
    outY=op.outNumber("Y");

inUpd.onTriggered=()=>
{
    let ele=inEle.get();
    if(!ele)
    {
        outX.set(0);
        outY.set(0);
        outWidth.set(0);
        outHeight.set(0);
        return;
    }
    const r=ele.getBoundingClientRect();
    const rCanv=op.patch.cgl.canvas.getBoundingClientRect();

    outX.set(r.left-rCanv.left);
    outY.set(r.top-rCanv.top);
    outWidth.set(r.width);
    outHeight.set(r.height);

};
