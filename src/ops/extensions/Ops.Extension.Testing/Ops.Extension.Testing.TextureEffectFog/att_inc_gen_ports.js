const port_vh3ct2j6k = op.inTrigger("vh3ct2j6k");
port_vh3ct2j6k.setUiAttribs({ "title": "add port", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_vh3ct2j6k = addedOps[i].outTrigger("innerOut_vh3ct2j6k");
            innerOut_vh3ct2j6k.setUiAttribs({ "title": "add port" });
            port_vh3ct2j6k.onTriggered = () => { innerOut_vh3ct2j6k.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
