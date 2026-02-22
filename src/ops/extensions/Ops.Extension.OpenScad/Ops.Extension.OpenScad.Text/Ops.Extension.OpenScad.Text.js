const
    update = op.inTrigger("Update"),
    inText=op.inString("Text","cables"),
    inSize=op.inFloat("Size",10),
    inFn=op.inInt("Fragments",0),

    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    let os=op.patch.tempData.compScad;
    let src= "text(\""+os.portValue(inText) + "\","+os.portValue(inSize);
    if(inFn.get()>0)src+=", $fn="+inFn.get();

    src+=");";

    os.op(op);
    os.addLine(src);

    next.trigger();
};
