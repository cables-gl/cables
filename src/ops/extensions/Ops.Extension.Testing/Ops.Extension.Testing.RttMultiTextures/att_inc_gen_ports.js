const port_mwasf8rcb = op.inTrigger("mwasf8rcb");
port_mwasf8rcb.setUiAttribs({ "title": "add port", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_mwasf8rcb = addedOps[i].outTrigger("innerOut_mwasf8rcb");
            innerOut_mwasf8rcb.setUiAttribs({ "title": "add port" });
            port_mwasf8rcb.onTriggered = () => { innerOut_mwasf8rcb.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
