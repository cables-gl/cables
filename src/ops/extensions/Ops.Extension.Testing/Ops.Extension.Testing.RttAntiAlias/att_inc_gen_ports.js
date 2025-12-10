const port_np6phy22o = op.inTrigger("np6phy22o");
port_np6phy22o.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_np6phy22o = addedOps[i].outTrigger("innerOut_np6phy22o");
            innerOut_np6phy22o.setUiAttribs({ "title": "exe" });
            port_np6phy22o.onTriggered = () => { innerOut_np6phy22o.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
