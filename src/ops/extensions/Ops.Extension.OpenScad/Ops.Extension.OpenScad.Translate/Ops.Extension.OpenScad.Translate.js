const
    update = op.inTrigger("Update"),
    inX=op.inFloat("X",0),
    inY=op.inFloat("Y",0),
    inZ=op.inFloat("Z",0),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    op.patch.tempData.compScad.addLine( "translate(["+inX.get()+","+inY.get()+","+inZ.get()+"])");

    op.patch.tempData.compScad.addLine( "{");
    op.patch.tempData.compScad.indentStart();

    next.trigger();
    op.patch.tempData.compScad.indentEnd();

    op.patch.tempData.compScad.addLine( "}");
    op.patch.tempData.compScad.addLine( );
};
