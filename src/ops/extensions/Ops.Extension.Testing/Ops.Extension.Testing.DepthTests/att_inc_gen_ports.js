const port_iswjcorus = op.inTrigger("iswjcorus");
port_iswjcorus.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_iswjcorus = addedOps[i].outTrigger("innerOut_iswjcorus");
            innerOut_iswjcorus.setUiAttribs({ "title": "exe" });
            port_iswjcorus.onTriggered = () => { innerOut_iswjcorus.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
