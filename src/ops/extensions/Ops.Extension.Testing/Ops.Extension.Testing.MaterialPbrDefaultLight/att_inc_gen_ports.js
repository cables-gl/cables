const port_5a0o2s03n = op.inTrigger("5a0o2s03n");
port_5a0o2s03n.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_5a0o2s03n = addedOps[i].outTrigger("innerOut_5a0o2s03n");
            innerOut_5a0o2s03n.setUiAttribs({ "title": "exe" });
            port_5a0o2s03n.onTriggered = () => { innerOut_5a0o2s03n.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
