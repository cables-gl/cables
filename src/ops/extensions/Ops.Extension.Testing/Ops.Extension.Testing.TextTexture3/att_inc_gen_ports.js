const port_xi5tmkdx1 = op.inTrigger("xi5tmkdx1");
port_xi5tmkdx1.setUiAttribs({ "title": "Render", "display": "button", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_xi5tmkdx1 = addedOps[i].outTrigger("innerOut_xi5tmkdx1");
            innerOut_xi5tmkdx1.setUiAttribs({ "title": "Render" });
            port_xi5tmkdx1.onTriggered = () => { innerOut_xi5tmkdx1.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
