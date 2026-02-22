const
    update = op.inTrigger("Update"),

    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1),
    next = op.outTrigger("Next");
r.setUiAttribs({ "colorPick": true });

update.onTriggered = () =>
{
    const os=op.patch.tempData.compScad;
    os.op(op);
    os.addLine( "color(c=["+(r.get())+","+(g.get())+","+(b.get())+","+(a.get())+"])");

    os.addLine( "{");
    os.indentStart();

    next.trigger();
    os.indentEnd();

    os.addLine( "}");
    os.addLine( );
};
