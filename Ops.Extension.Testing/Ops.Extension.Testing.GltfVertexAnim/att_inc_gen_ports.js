const port_fwagmglix = op.inTrigger("fwagmglix");
port_fwagmglix.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_fwagmglix = addedOps[i].outTrigger("innerOut_fwagmglix");
            innerOut_fwagmglix.setUiAttribs({ "title": "render" });
            port_fwagmglix.onTriggered = () => { innerOut_fwagmglix.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
