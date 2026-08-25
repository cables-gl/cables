const port_d8cka40ch = op.inTrigger("d8cka40ch");
port_d8cka40ch.setUiAttribs({ "title": "render" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_d8cka40ch = addedOps[i].outTrigger("innerOut_d8cka40ch");
            innerOut_d8cka40ch.setUiAttribs({ "title": "render" });
            port_d8cka40ch.onTriggered = () => { innerOut_d8cka40ch.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
