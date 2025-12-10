const port_jgd3p9ogs = op.inTrigger("jgd3p9ogs");
port_jgd3p9ogs.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_jgd3p9ogs = addedOps[i].outTrigger("innerOut_jgd3p9ogs");
            innerOut_jgd3p9ogs.setUiAttribs({ "title": "exe" });
            port_jgd3p9ogs.onTriggered = () => { innerOut_jgd3p9ogs.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
