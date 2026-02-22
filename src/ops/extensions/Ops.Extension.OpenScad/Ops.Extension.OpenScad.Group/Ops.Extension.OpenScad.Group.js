const
    update = op.inTrigger("Update"),
meth=op.inDropDown("Method",["Union","Difference","Intersection","Hull"],"Union"),
    nexts = op.outMultiPort2("Trigger", CABLES.OP_PORT_TYPE_TRIGGER, { "display": "button" },4);

meth.onChange = () => { op.setUiAttrib({ "extendTitle": meth.get()  }); };

update.onTriggered = () =>
{
    const os=op.patch.tempData.compScad;
    os.op(op);

    op.patch.tempData.compScad.addLine( meth.get().toLowerCase()+"()");
    op.patch.tempData.compScad.addLine( "{");
    op.patch.tempData.compScad.indentStart();

    for (let i = 0; i < nexts.get().length; i++)
    {
        nexts.get()[i].trigger();
    }

    op.patch.tempData.compScad.indentEnd();
    op.patch.tempData.compScad.addLine( "}");

};
