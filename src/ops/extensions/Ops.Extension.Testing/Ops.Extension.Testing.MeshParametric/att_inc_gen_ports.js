const port_i1w5a4y1i = op.inTrigger("i1w5a4y1i");
port_i1w5a4y1i.setUiAttribs({ "title": "Trigger In", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_i1w5a4y1i = addedOps[i].outTrigger("innerOut_i1w5a4y1i");
            innerOut_i1w5a4y1i.setUiAttribs({ "title": "Trigger In" });
            port_i1w5a4y1i.onTriggered = () => { innerOut_i1w5a4y1i.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
