const
    update = op.inTrigger("Update"),
    inX=op.inFloat("X",0),
    inY=op.inFloat("Y",0),
    inZ=op.inFloat("Z",0),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    const os=op.patch.tempData.compScad;
    os.op(op);
    os.addLine( "translate(["+os.portValue(inX)+","+os.portValue(inY)+","+os.portValue(inZ)+"])");

    os.addLine( "{");
    os.indentStart();

    next.trigger();
    os.indentEnd();

    os.addLine( "}");
    os.addLine( );
};
