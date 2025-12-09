const port_5rvaih4mf = op.inTrigger("5rvaih4mf");
port_5rvaih4mf.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_5rvaih4mf = addedOps[i].outTrigger("innerOut_5rvaih4mf");
            innerOut_5rvaih4mf.setUiAttribs({ "title": "render" });
            port_5rvaih4mf.onTriggered = () => { innerOut_5rvaih4mf.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
