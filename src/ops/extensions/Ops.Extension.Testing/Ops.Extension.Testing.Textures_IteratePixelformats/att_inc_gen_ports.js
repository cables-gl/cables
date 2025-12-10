const port_8rdpwhakn = op.inTrigger("8rdpwhakn");
port_8rdpwhakn.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_8rdpwhakn = addedOps[i].outTrigger("innerOut_8rdpwhakn");
            innerOut_8rdpwhakn.setUiAttribs({ "title": "exe" });
            port_8rdpwhakn.onTriggered = () => { innerOut_8rdpwhakn.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
