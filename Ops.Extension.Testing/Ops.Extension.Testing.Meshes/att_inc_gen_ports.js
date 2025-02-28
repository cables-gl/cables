const port_k935a8335 = op.inTrigger("k935a8335");
port_k935a8335.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_k935a8335 = addedOps[i].outTrigger("innerOut_k935a8335");
            innerOut_k935a8335.setUiAttribs({ "title": "render" });
            port_k935a8335.onTriggered = () => { innerOut_k935a8335.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
