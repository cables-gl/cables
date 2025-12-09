const port_cinpsynpg = op.inTrigger("cinpsynpg");
port_cinpsynpg.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_cinpsynpg = addedOps[i].outTrigger("innerOut_cinpsynpg");
            innerOut_cinpsynpg.setUiAttribs({ "title": "render" });
            port_cinpsynpg.onTriggered = () => { innerOut_cinpsynpg.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
