const port_5us4er1ya = op.inTrigger("5us4er1ya");
port_5us4er1ya.setUiAttribs({ "title": "Execute", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_5us4er1ya = addedOps[i].outTrigger("innerOut_5us4er1ya");
            innerOut_5us4er1ya.setUiAttribs({ "title": "Execute" });
            port_5us4er1ya.onTriggered = () => { innerOut_5us4er1ya.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
