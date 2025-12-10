const port_yfuee3i7h = op.inTrigger("yfuee3i7h");
port_yfuee3i7h.setUiAttribs({ "title": "Render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_yfuee3i7h = addedOps[i].outTrigger("innerOut_yfuee3i7h");
            innerOut_yfuee3i7h.setUiAttribs({ "title": "Render" });
            port_yfuee3i7h.onTriggered = () => { innerOut_yfuee3i7h.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
