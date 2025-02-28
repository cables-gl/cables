const port_xawjsc4dm = op.inTrigger("xawjsc4dm");
port_xawjsc4dm.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_xawjsc4dm = addedOps[i].outTrigger("innerOut_xawjsc4dm");
            innerOut_xawjsc4dm.setUiAttribs({ "title": "render" });
            port_xawjsc4dm.onTriggered = () => { innerOut_xawjsc4dm.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
