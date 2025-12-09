const port_6rv86pwy2 = op.inTrigger("6rv86pwy2");
port_6rv86pwy2.setUiAttribs({ "title": "Render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_6rv86pwy2 = addedOps[i].outTrigger("innerOut_6rv86pwy2");
            innerOut_6rv86pwy2.setUiAttribs({ "title": "Render" });
            port_6rv86pwy2.onTriggered = () => { innerOut_6rv86pwy2.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
