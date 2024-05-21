const port_i12xmn1tz = op.inTrigger("i12xmn1tz");
port_i12xmn1tz.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_i12xmn1tz = addedOps[i].outTrigger("innerOut_i12xmn1tz");
            innerOut_i12xmn1tz.setUiAttribs({ "title": "render" });
            port_i12xmn1tz.onTriggered = () => { innerOut_i12xmn1tz.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
