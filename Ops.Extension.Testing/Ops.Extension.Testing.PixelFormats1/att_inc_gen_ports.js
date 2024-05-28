const port_t8j1xeuvg = op.inTrigger("t8j1xeuvg");
port_t8j1xeuvg.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_t8j1xeuvg = addedOps[i].outTrigger("innerOut_t8j1xeuvg");
            innerOut_t8j1xeuvg.setUiAttribs({ "title": "render" });
            port_t8j1xeuvg.onTriggered = () => { innerOut_t8j1xeuvg.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
