const port_xw08j02i4 = op.inTrigger("xw08j02i4");
port_xw08j02i4.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_xw08j02i4 = addedOps[i].outTrigger("innerOut_xw08j02i4");
            innerOut_xw08j02i4.setUiAttribs({ "title": "exe" });
            port_xw08j02i4.onTriggered = () => { innerOut_xw08j02i4.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
