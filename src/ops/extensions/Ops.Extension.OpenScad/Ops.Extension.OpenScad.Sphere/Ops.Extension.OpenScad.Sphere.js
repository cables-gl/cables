const
    update = op.inTrigger("Update"),
    inRadius=op.inFloat("Radius",1),
    inFn=op.inInt("Fragments",0),
    inMod=op.inSwitch("Modifier",["None","Debug","Disable","Only","Transp"]," None"),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    const os=op.patch.tempData.compScad;
    os.op(op);

    let src="";

    src+=os.mod(inMod)
    src += "sphere(";
    src += "r="+os.portValue(inRadius);
    if(inFn.get()>0)src+=", $fn="+inFn.get()
    src += ");";

    os.addLine(src);

    next.trigger();
};
