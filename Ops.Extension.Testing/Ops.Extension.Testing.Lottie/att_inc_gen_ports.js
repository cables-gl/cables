const port_nwshu8bql = op.inTrigger("nwshu8bql");
port_nwshu8bql.setUiAttribs({ "title": "exe 4", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_nwshu8bql = addedOps[i].outTrigger("innerOut_nwshu8bql");
            innerOut_nwshu8bql.setUiAttribs({ "title": "exe 4" });
            port_nwshu8bql.onTriggered = () => { innerOut_nwshu8bql.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
