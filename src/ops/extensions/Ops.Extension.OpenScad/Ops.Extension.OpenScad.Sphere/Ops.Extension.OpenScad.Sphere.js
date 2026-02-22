const
    update = op.inTrigger("Update"),
    inRadius=op.inFloat("Radius",1),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    let src="";
    src += "sphere(";
    src += "r="+inRadius.get();
    src += ");";

    op.patch.tempData.compScad.addLine(src);
    next.trigger();
};
