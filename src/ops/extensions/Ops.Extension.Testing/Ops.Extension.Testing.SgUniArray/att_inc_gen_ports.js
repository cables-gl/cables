const port_dvwmommrh = op.inTrigger("dvwmommrh");
port_dvwmommrh.setUiAttribs({ "title": "Render" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_dvwmommrh = addedOps[i].outTrigger("innerOut_dvwmommrh");
            innerOut_dvwmommrh.setUiAttribs({ "title": "Render" });
            port_dvwmommrh.onTriggered = () => { innerOut_dvwmommrh.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
