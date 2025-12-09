const port_lacac1n9z = op.inTrigger("lacac1n9z");
port_lacac1n9z.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_lacac1n9z = addedOps[i].outTrigger("innerOut_lacac1n9z");
            innerOut_lacac1n9z.setUiAttribs({ "title": "exe" });
            port_lacac1n9z.onTriggered = () => { innerOut_lacac1n9z.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
