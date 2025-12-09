const port_svlvq58ex = op.inTrigger("svlvq58ex");
port_svlvq58ex.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_svlvq58ex = addedOps[i].outTrigger("innerOut_svlvq58ex");
            innerOut_svlvq58ex.setUiAttribs({ "title": "render" });
            port_svlvq58ex.onTriggered = () => { innerOut_svlvq58ex.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
