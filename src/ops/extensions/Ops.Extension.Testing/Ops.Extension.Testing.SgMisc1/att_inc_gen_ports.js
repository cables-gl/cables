const port_2ob7oeqi9 = op.inTrigger("2ob7oeqi9");
port_2ob7oeqi9.setUiAttribs({ "title": "Render" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_2ob7oeqi9 = addedOps[i].outTrigger("innerOut_2ob7oeqi9");
            innerOut_2ob7oeqi9.setUiAttribs({ "title": "Render" });
            port_2ob7oeqi9.onTriggered = () => { innerOut_2ob7oeqi9.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
