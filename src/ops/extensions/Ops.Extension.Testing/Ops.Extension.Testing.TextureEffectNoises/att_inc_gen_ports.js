const port_z2muwpq37 = op.inTrigger("z2muwpq37");
port_z2muwpq37.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_z2muwpq37 = addedOps[i].outTrigger("innerOut_z2muwpq37");
            innerOut_z2muwpq37.setUiAttribs({ "title": "exe" });
            port_z2muwpq37.onTriggered = () => { innerOut_z2muwpq37.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
