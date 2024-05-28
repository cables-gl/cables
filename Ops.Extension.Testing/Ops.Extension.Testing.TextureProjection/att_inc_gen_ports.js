const port_f6bg8yipf = op.inTrigger("f6bg8yipf");
port_f6bg8yipf.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_f6bg8yipf = addedOps[i].outTrigger("innerOut_f6bg8yipf");
            innerOut_f6bg8yipf.setUiAttribs({ "title": "render" });
            port_f6bg8yipf.onTriggered = () => { innerOut_f6bg8yipf.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
