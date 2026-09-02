const port_tkzlsqhqo = op.inTrigger("tkzlsqhqo");
port_tkzlsqhqo.setUiAttribs({ "title": "Trigger" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_tkzlsqhqo = addedOps[i].outTrigger("innerOut_tkzlsqhqo");
            innerOut_tkzlsqhqo.setUiAttribs({ "title": "Trigger" });
            port_tkzlsqhqo.onTriggered = () => { innerOut_tkzlsqhqo.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
