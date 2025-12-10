const port_pl4v6t4tr = op.inTrigger("pl4v6t4tr");
port_pl4v6t4tr.setUiAttribs({ "title": "Execute", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_pl4v6t4tr = addedOps[i].outTrigger("innerOut_pl4v6t4tr");
            innerOut_pl4v6t4tr.setUiAttribs({ "title": "Execute" });
            port_pl4v6t4tr.onTriggered = () => { innerOut_pl4v6t4tr.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
