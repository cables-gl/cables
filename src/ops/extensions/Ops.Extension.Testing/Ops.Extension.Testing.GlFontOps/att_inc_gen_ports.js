const port_irfsukv96 = op.inTrigger("irfsukv96");
port_irfsukv96.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_irfsukv96 = addedOps[i].outTrigger("innerOut_irfsukv96");
            innerOut_irfsukv96.setUiAttribs({ "title": "render" });
            port_irfsukv96.onTriggered = () => { innerOut_irfsukv96.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
