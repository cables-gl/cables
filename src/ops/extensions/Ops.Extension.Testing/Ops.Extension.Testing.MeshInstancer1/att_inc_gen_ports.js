const port_op5tk4ww9 = op.inTrigger("op5tk4ww9");
port_op5tk4ww9.setUiAttribs({ "title": "Render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_op5tk4ww9 = addedOps[i].outTrigger("innerOut_op5tk4ww9");
            innerOut_op5tk4ww9.setUiAttribs({ "title": "Render" });
            port_op5tk4ww9.onTriggered = () => { innerOut_op5tk4ww9.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
