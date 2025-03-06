const port_illl1hd86 = op.inTrigger("illl1hd86");
port_illl1hd86.setUiAttribs({ "title": "Render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_illl1hd86 = addedOps[i].outTrigger("innerOut_illl1hd86");
            innerOut_illl1hd86.setUiAttribs({ "title": "Render" });
            port_illl1hd86.onTriggered = () => { innerOut_illl1hd86.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
