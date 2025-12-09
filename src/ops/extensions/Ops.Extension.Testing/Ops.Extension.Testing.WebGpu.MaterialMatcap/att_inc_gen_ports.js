const port_qw7jefyox = op.inTrigger("qw7jefyox");
port_qw7jefyox.setUiAttribs({ "title": "Render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_qw7jefyox = addedOps[i].outTrigger("innerOut_qw7jefyox");
            innerOut_qw7jefyox.setUiAttribs({ "title": "Render" });
            port_qw7jefyox.onTriggered = () => { innerOut_qw7jefyox.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
