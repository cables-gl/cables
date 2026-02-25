const
    update = op.inTrigger("Update"),
    inX=op.inBool("X",0),
    inY=op.inBool("Y",0),
    inZ=op.inBool("Z",0),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    const os=op.patch.tempData.compScad;
    os.op(op);
    os.addLine( "mirror(["+os.portValue(inX)+","+os.portValue(inY)+","+os.portValue(inZ)+"]) {");

    os.indentStart();

    next.trigger();
    os.indentEnd();

    os.addLine( "}");
    os.addLine( );
};
