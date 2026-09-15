const port_faomvg0k0 = op.inTrigger("faomvg0k0");
port_faomvg0k0.setUiAttribs({ "title": "Render" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_faomvg0k0 = addedOps[i].outTrigger("innerOut_faomvg0k0");
            innerOut_faomvg0k0.setUiAttribs({ "title": "Render" });
            port_faomvg0k0.onTriggered = () => { innerOut_faomvg0k0.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
