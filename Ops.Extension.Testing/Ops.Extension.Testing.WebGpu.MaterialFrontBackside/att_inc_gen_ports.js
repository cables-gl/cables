const port_olwxqen5n = op.inTrigger("olwxqen5n");
port_olwxqen5n.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_olwxqen5n = addedOps[i].outTrigger("innerOut_olwxqen5n");
            innerOut_olwxqen5n.setUiAttribs({ "title": "render" });
            port_olwxqen5n.onTriggered = () => { innerOut_olwxqen5n.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
