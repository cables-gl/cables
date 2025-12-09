const port_b1x542rkx = op.inTrigger("b1x542rkx");
port_b1x542rkx.setUiAttribs({ "title": "Render", "display": "button", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_b1x542rkx = addedOps[i].outTrigger("innerOut_b1x542rkx");
            innerOut_b1x542rkx.setUiAttribs({ "title": "Render" });
            port_b1x542rkx.onTriggered = () => { innerOut_b1x542rkx.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
