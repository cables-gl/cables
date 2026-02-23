const
    update = op.inTrigger("Update"),
    inX=op.inFloat("Radius",1),
    inChamf=op.inBool("Chamfer",false),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    const os=op.patch.tempData.compScad;
    os.op(op);
    let src="offset(r="+os.portValue(inX);

    if(inChamf.get())src+=", chamfer=true";

    src+=")";
    os.addLine(src);

    os.addLine( "{");
    os.indentStart();

    next.trigger();
    os.indentEnd();

    os.addLine( "}");
    os.addLine( );
};
