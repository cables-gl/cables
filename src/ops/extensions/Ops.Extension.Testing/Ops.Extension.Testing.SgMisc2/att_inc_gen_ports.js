const port_lznrqavrm = op.inTrigger("lznrqavrm");
port_lznrqavrm.setUiAttribs({ "title": "Render" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_lznrqavrm = addedOps[i].outTrigger("innerOut_lznrqavrm");
            innerOut_lznrqavrm.setUiAttribs({ "title": "Render" });
            port_lznrqavrm.onTriggered = () => { innerOut_lznrqavrm.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
