const port_3bpya44sy = op.inTrigger("3bpya44sy");
port_3bpya44sy.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_3bpya44sy = addedOps[i].outTrigger("innerOut_3bpya44sy");
            innerOut_3bpya44sy.setUiAttribs({ "title": "exe" });
            port_3bpya44sy.onTriggered = () => { innerOut_3bpya44sy.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
