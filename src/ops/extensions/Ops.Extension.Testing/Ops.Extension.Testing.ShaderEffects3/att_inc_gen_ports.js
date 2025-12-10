const port_5oxvqg1zw = op.inTrigger("5oxvqg1zw");
port_5oxvqg1zw.setUiAttribs({ "title": "Trigger In", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_5oxvqg1zw = addedOps[i].outTrigger("innerOut_5oxvqg1zw");
            innerOut_5oxvqg1zw.setUiAttribs({ "title": "Trigger In" });
            port_5oxvqg1zw.onTriggered = () => { innerOut_5oxvqg1zw.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
