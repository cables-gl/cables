const port_xqbvduifk = op.inTrigger("xqbvduifk");
port_xqbvduifk.setUiAttribs({ "title": "Render" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_xqbvduifk = addedOps[i].outTrigger("innerOut_xqbvduifk");
            innerOut_xqbvduifk.setUiAttribs({ "title": "Render" });
            port_xqbvduifk.onTriggered = () => { innerOut_xqbvduifk.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
