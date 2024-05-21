const port_94uzkbsko = op.inTrigger("94uzkbsko");
port_94uzkbsko.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_94uzkbsko = addedOps[i].outTrigger("innerOut_94uzkbsko");
            innerOut_94uzkbsko.setUiAttribs({ "title": "render" });
            port_94uzkbsko.onTriggered = () => { innerOut_94uzkbsko.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
