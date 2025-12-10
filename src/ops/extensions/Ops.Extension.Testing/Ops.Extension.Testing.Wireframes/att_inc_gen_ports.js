const port_6hwu16nrl = op.inTrigger("6hwu16nrl");
port_6hwu16nrl.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_6hwu16nrl = addedOps[i].outTrigger("innerOut_6hwu16nrl");
            innerOut_6hwu16nrl.setUiAttribs({ "title": "render" });
            port_6hwu16nrl.onTriggered = () => { innerOut_6hwu16nrl.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
