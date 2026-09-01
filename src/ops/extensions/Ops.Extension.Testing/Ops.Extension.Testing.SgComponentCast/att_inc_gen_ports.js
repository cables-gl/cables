const port_afl5yq365 = op.inTrigger("afl5yq365");
port_afl5yq365.setUiAttribs({ "title": "render" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_afl5yq365 = addedOps[i].outTrigger("innerOut_afl5yq365");
            innerOut_afl5yq365.setUiAttribs({ "title": "render" });
            port_afl5yq365.onTriggered = () => { innerOut_afl5yq365.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
