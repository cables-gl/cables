const port_3ag0l5i42 = op.inTrigger("3ag0l5i42");
port_3ag0l5i42.setUiAttribs({ "title": "exe 0", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_3ag0l5i42 = addedOps[i].outTrigger("innerOut_3ag0l5i42");
            innerOut_3ag0l5i42.setUiAttribs({ "title": "exe 0" });
            port_3ag0l5i42.onTriggered = () => { innerOut_3ag0l5i42.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
