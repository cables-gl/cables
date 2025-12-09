const port_fsenyje1f = op.inTrigger("fsenyje1f");
port_fsenyje1f.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_fsenyje1f = addedOps[i].outTrigger("innerOut_fsenyje1f");
            innerOut_fsenyje1f.setUiAttribs({ "title": "render" });
            port_fsenyje1f.onTriggered = () => { innerOut_fsenyje1f.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
