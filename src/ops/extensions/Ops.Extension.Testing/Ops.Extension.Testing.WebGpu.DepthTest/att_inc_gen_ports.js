const port_ak22at9pn = op.inTrigger("ak22at9pn");
port_ak22at9pn.setUiAttribs({ "title": "Render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_ak22at9pn = addedOps[i].outTrigger("innerOut_ak22at9pn");
            innerOut_ak22at9pn.setUiAttribs({ "title": "Render" });
            port_ak22at9pn.onTriggered = () => { innerOut_ak22at9pn.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
