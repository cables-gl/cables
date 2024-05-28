const port_m57hn1hvy = op.inTrigger("m57hn1hvy");
port_m57hn1hvy.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_m57hn1hvy = addedOps[i].outTrigger("innerOut_m57hn1hvy");
            innerOut_m57hn1hvy.setUiAttribs({ "title": "render" });
            port_m57hn1hvy.onTriggered = () => { innerOut_m57hn1hvy.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
