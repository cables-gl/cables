const port_9y725kusw = op.inTrigger("9y725kusw");
port_9y725kusw.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_9y725kusw = addedOps[i].outTrigger("innerOut_9y725kusw");
            innerOut_9y725kusw.setUiAttribs({ "title": "render" });
            port_9y725kusw.onTriggered = () => { innerOut_9y725kusw.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
