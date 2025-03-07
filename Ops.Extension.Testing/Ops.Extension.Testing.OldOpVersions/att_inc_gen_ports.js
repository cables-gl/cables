const port_zktzehzdz = op.inTrigger("zktzehzdz");
port_zktzehzdz.setUiAttribs({ "title": "Render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_zktzehzdz = addedOps[i].outTrigger("innerOut_zktzehzdz");
            innerOut_zktzehzdz.setUiAttribs({ "title": "Render" });
            port_zktzehzdz.onTriggered = () => { innerOut_zktzehzdz.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
