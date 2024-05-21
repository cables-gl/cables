const port_c00vz047h = op.inTrigger("c00vz047h");
port_c00vz047h.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_c00vz047h = addedOps[i].outTrigger("innerOut_c00vz047h");
            innerOut_c00vz047h.setUiAttribs({ "title": "render" });
            port_c00vz047h.onTriggered = () => { innerOut_c00vz047h.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
