const port_pn5m90tob = op.inTrigger("pn5m90tob");
port_pn5m90tob.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_pn5m90tob = addedOps[i].outTrigger("innerOut_pn5m90tob");
            innerOut_pn5m90tob.setUiAttribs({ "title": "exe" });
            port_pn5m90tob.onTriggered = () => { innerOut_pn5m90tob.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
