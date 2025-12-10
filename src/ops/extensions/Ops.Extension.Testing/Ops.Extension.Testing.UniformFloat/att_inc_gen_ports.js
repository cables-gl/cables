const port_8vzo4at28 = op.inTrigger("8vzo4at28");
port_8vzo4at28.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_8vzo4at28 = addedOps[i].outTrigger("innerOut_8vzo4at28");
            innerOut_8vzo4at28.setUiAttribs({ "title": "render" });
            port_8vzo4at28.onTriggered = () => { innerOut_8vzo4at28.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
