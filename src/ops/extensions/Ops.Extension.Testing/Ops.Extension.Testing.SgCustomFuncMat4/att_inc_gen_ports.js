const port_5hp2gjnna = op.inTrigger("5hp2gjnna");
port_5hp2gjnna.setUiAttribs({ "title": "exe" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_5hp2gjnna = addedOps[i].outTrigger("innerOut_5hp2gjnna");
            innerOut_5hp2gjnna.setUiAttribs({ "title": "exe" });
            port_5hp2gjnna.onTriggered = () => { innerOut_5hp2gjnna.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
