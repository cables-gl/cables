const port_53nc07ubx = op.inTrigger("53nc07ubx");
port_53nc07ubx.setUiAttribs({ "title": "Trigger", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_53nc07ubx = addedOps[i].outTrigger("innerOut_53nc07ubx");
            innerOut_53nc07ubx.setUiAttribs({ "title": "Trigger" });
            port_53nc07ubx.onTriggered = () => { innerOut_53nc07ubx.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
