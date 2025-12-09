const port_2iql9t2yc = op.inTrigger("2iql9t2yc");
port_2iql9t2yc.setUiAttribs({ "title": "exe 2", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_2iql9t2yc = addedOps[i].outTrigger("innerOut_2iql9t2yc");
            innerOut_2iql9t2yc.setUiAttribs({ "title": "exe 2" });
            port_2iql9t2yc.onTriggered = () => { innerOut_2iql9t2yc.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
