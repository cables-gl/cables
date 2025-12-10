const port_xnpopxzzg = op.inTrigger("xnpopxzzg");
port_xnpopxzzg.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_xnpopxzzg = addedOps[i].outTrigger("innerOut_xnpopxzzg");
            innerOut_xnpopxzzg.setUiAttribs({ "title": "render" });
            port_xnpopxzzg.onTriggered = () => { innerOut_xnpopxzzg.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
