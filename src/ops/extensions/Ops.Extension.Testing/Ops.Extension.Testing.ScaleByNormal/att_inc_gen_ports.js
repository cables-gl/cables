const port_o41up594i = op.inTrigger("o41up594i");
port_o41up594i.setUiAttribs({ "title": "Trigger In", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_o41up594i = addedOps[i].outTrigger("innerOut_o41up594i");
            innerOut_o41up594i.setUiAttribs({ "title": "Trigger In" });
            port_o41up594i.onTriggered = () => { innerOut_o41up594i.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
