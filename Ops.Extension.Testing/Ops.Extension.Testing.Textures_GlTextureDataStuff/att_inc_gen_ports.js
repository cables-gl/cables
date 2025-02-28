const port_ibuji90r6 = op.inTrigger("ibuji90r6");
port_ibuji90r6.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_ibuji90r6 = addedOps[i].outTrigger("innerOut_ibuji90r6");
            innerOut_ibuji90r6.setUiAttribs({ "title": "exe" });
            port_ibuji90r6.onTriggered = () => { innerOut_ibuji90r6.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
