const port_1xuq00pwz = op.inTrigger("1xuq00pwz");
port_1xuq00pwz.setUiAttribs({ "title": "Trigger_24", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_1xuq00pwz = addedOps[i].outTrigger("innerOut_1xuq00pwz");
            innerOut_1xuq00pwz.setUiAttribs({ "title": "Trigger_24" });
            port_1xuq00pwz.onTriggered = () => { innerOut_1xuq00pwz.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
