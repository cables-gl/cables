const port_chk10pfcg = op.inTrigger("chk10pfcg");
port_chk10pfcg.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_chk10pfcg = addedOps[i].outTrigger("innerOut_chk10pfcg");
            innerOut_chk10pfcg.setUiAttribs({ "title": "render" });
            port_chk10pfcg.onTriggered = () => { innerOut_chk10pfcg.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
