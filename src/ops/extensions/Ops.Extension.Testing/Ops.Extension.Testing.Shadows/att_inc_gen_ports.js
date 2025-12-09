const port_0a348cwyd = op.inTrigger("0a348cwyd");
port_0a348cwyd.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_0a348cwyd = addedOps[i].outTrigger("innerOut_0a348cwyd");
            innerOut_0a348cwyd.setUiAttribs({ "title": "exe" });
            port_0a348cwyd.onTriggered = () => { innerOut_0a348cwyd.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
