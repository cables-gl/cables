const port_36nbm6qlt = op.outTrigger("36nbm6qlt");
port_36nbm6qlt.setUiAttribs({ "title": "trigger" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {}
        if (addedOps[i].innerOutput)
        {
            const innerIn_36nbm6qlt = addedOps[i].inTrigger("innerIn_36nbm6qlt");
            innerIn_36nbm6qlt.setUiAttribs({ "title": "trigger" });
            innerIn_36nbm6qlt.onTriggered = () => { port_36nbm6qlt.trigger(); };

        }
    }
};
