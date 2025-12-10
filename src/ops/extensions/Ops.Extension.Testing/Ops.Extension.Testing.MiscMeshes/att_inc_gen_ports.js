const port_s4byq8yde = op.inTrigger("s4byq8yde");
port_s4byq8yde.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_s4byq8yde = addedOps[i].outTrigger("innerOut_s4byq8yde");
            innerOut_s4byq8yde.setUiAttribs({ "title": "render" });
            port_s4byq8yde.onTriggered = () => { innerOut_s4byq8yde.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
