const port_sfz56isqv = op.inTrigger("sfz56isqv");
port_sfz56isqv.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_sfz56isqv = addedOps[i].outTrigger("innerOut_sfz56isqv");
            innerOut_sfz56isqv.setUiAttribs({ "title": "render" });
            port_sfz56isqv.onTriggered = () => { innerOut_sfz56isqv.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
