const port_aaa7f6agy = op.inTrigger("aaa7f6agy");
port_aaa7f6agy.setUiAttribs({ "title": "Trigger" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_aaa7f6agy = addedOps[i].outTrigger("innerOut_aaa7f6agy");
            innerOut_aaa7f6agy.setUiAttribs({ "title": "Trigger" });
            port_aaa7f6agy.onTriggered = () => { innerOut_aaa7f6agy.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
