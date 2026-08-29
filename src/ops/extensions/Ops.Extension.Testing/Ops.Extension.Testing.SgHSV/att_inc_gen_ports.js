const port_n4tyellip = op.inTrigger("n4tyellip");
port_n4tyellip.setUiAttribs({ "title": "Render" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_n4tyellip = addedOps[i].outTrigger("innerOut_n4tyellip");
            innerOut_n4tyellip.setUiAttribs({ "title": "Render" });
            port_n4tyellip.onTriggered = () => { innerOut_n4tyellip.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
