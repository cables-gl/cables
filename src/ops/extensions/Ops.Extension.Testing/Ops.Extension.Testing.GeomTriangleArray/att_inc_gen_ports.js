const port_r4g16i129 = op.inTrigger("r4g16i129");
port_r4g16i129.setUiAttribs({ "title": "Render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_r4g16i129 = addedOps[i].outTrigger("innerOut_r4g16i129");
            innerOut_r4g16i129.setUiAttribs({ "title": "Render" });
            port_r4g16i129.onTriggered = () => { innerOut_r4g16i129.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
