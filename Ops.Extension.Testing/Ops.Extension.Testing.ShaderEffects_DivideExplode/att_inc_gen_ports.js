const port_03ppcwk5o = op.inTrigger("03ppcwk5o");
port_03ppcwk5o.setUiAttribs({ "title": "Trigger In", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_03ppcwk5o = addedOps[i].outTrigger("innerOut_03ppcwk5o");
            innerOut_03ppcwk5o.setUiAttribs({ "title": "Trigger In" });
            port_03ppcwk5o.onTriggered = () => { innerOut_03ppcwk5o.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
