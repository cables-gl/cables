const port_iny8hvm6a = op.inTrigger("iny8hvm6a");
port_iny8hvm6a.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_iny8hvm6a = addedOps[i].outTrigger("innerOut_iny8hvm6a");
            innerOut_iny8hvm6a.setUiAttribs({ "title": "render" });
            port_iny8hvm6a.onTriggered = () => { innerOut_iny8hvm6a.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
