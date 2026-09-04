const
    inTrigs = op.inMultiPort2("Input", CABLES.Port.TYPE_FUNCTION, null, 4),
    outTrigs = op.outMultiPort2("Output", CABLES.Port.TYPE_FUNCTION, null, 4);

op.setUiAttrib({ "resizable": true, "resizableY": false, "stretchPorts": true });

inTrigs.onTriggered = (index) =>
{
    const ports = outTrigs.get();

    for (let i = 0; i < ports.length; i++)
    {
        ports[i].trigger();
    }
};
