const port_ieyg62tzx = op.inTrigger("ieyg62tzx");
port_ieyg62tzx.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_ieyg62tzx = addedOps[i].outTrigger("innerOut_ieyg62tzx");
            innerOut_ieyg62tzx.setUiAttribs({ "title": "render" });
            port_ieyg62tzx.onTriggered = () => { innerOut_ieyg62tzx.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
