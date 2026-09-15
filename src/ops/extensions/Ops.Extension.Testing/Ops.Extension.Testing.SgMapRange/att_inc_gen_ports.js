const port_wl191ja04 = op.inTrigger("wl191ja04");
port_wl191ja04.setUiAttribs({ "title": "Render" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_wl191ja04 = addedOps[i].outTrigger("innerOut_wl191ja04");
            innerOut_wl191ja04.setUiAttribs({ "title": "Render" });
            port_wl191ja04.onTriggered = () => { innerOut_wl191ja04.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
