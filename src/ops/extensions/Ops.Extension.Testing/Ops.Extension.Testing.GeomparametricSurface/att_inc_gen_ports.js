const port_abanowndy = op.inTrigger("abanowndy");
port_abanowndy.setUiAttribs({ "title": "Trigger In", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_abanowndy = addedOps[i].outTrigger("innerOut_abanowndy");
            innerOut_abanowndy.setUiAttribs({ "title": "Trigger In" });
            port_abanowndy.onTriggered = () => { innerOut_abanowndy.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
