const port_wvz6radmb = op.inTrigger("wvz6radmb");
port_wvz6radmb.setUiAttribs({ "title": "Trigger In", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_wvz6radmb = addedOps[i].outTrigger("innerOut_wvz6radmb");
            innerOut_wvz6radmb.setUiAttribs({ "title": "Trigger In" });
            port_wvz6radmb.onTriggered = () => { innerOut_wvz6radmb.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
