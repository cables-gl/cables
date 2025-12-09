const port_vwsh29coc = op.inTrigger("vwsh29coc");
port_vwsh29coc.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_vwsh29coc = addedOps[i].outTrigger("innerOut_vwsh29coc");
            innerOut_vwsh29coc.setUiAttribs({ "title": "render" });
            port_vwsh29coc.onTriggered = () => { innerOut_vwsh29coc.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
