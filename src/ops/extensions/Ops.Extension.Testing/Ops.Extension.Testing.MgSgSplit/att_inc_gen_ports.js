const port_odid1j1p6 = op.inTrigger("odid1j1p6");
port_odid1j1p6.setUiAttribs({ "title": "Trigger" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_odid1j1p6 = addedOps[i].outTrigger("innerOut_odid1j1p6");
            innerOut_odid1j1p6.setUiAttribs({ "title": "Trigger" });
            port_odid1j1p6.onTriggered = () => { innerOut_odid1j1p6.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
