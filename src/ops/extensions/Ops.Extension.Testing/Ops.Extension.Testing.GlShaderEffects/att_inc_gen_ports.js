const port_djptfxfqo = op.inTrigger("djptfxfqo");
port_djptfxfqo.setUiAttribs({ "title": "Render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_djptfxfqo = addedOps[i].outTrigger("innerOut_djptfxfqo");
            innerOut_djptfxfqo.setUiAttribs({ "title": "Render" });
            port_djptfxfqo.onTriggered = () => { innerOut_djptfxfqo.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
