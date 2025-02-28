const port_9avwj5ssn = op.inTrigger("9avwj5ssn");
port_9avwj5ssn.setUiAttribs({ "title": "Trigger_43", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_9avwj5ssn = addedOps[i].outTrigger("innerOut_9avwj5ssn");
            innerOut_9avwj5ssn.setUiAttribs({ "title": "Trigger_43" });
            port_9avwj5ssn.onTriggered = () => { innerOut_9avwj5ssn.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
