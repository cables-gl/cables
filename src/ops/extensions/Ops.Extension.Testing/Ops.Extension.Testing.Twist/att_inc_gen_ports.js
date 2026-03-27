const port_2put91i6v = op.inTrigger("2put91i6v");
port_2put91i6v.setUiAttribs({ "title": "Trigger In", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_2put91i6v = addedOps[i].outTrigger("innerOut_2put91i6v");
            innerOut_2put91i6v.setUiAttribs({ "title": "Trigger In" });
            port_2put91i6v.onTriggered = () => { innerOut_2put91i6v.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
