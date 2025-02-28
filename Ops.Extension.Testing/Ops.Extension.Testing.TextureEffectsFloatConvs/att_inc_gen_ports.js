const port_9ruhsdsh9 = op.inTrigger("9ruhsdsh9");
port_9ruhsdsh9.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_9ruhsdsh9 = addedOps[i].outTrigger("innerOut_9ruhsdsh9");
            innerOut_9ruhsdsh9.setUiAttribs({ "title": "exe" });
            port_9ruhsdsh9.onTriggered = () => { innerOut_9ruhsdsh9.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
