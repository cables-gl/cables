const
    update = op.inTrigger("Update"),
    inRadius=op.inFloat("Radius",1),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    const os=op.patch.tempData.compScad;
    os.op(op);

    let src="";
    src += "sphere(";
    src += "r="+os.portValue(inRadius);
    src += ");";

    os.addLine(src);

    next.trigger();
};
