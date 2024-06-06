const
    inTrigs = op.inMultiPort("Input", CABLES.OP_PORT_TYPE_FUNCTION),
    outTrigs = op.outMultiPort("Output", CABLES.OP_PORT_TYPE_FUNCTION);

// op.setUiAttrib({ "resizable": true, "resizableY": false, "stretchPorts": true });

inTrigs.onTriggered = (index) =>
{
    const ports = outTrigs.get();

    for (let i = 0; i < ports.length; i++)
    {
        ports[i].trigger();
    }
};
