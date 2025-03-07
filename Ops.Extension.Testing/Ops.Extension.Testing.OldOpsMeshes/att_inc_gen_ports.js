const port_0q6kaxu7e = op.inTrigger("0q6kaxu7e");
port_0q6kaxu7e.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_0q6kaxu7e = addedOps[i].outTrigger("innerOut_0q6kaxu7e");
            innerOut_0q6kaxu7e.setUiAttribs({ "title": "render" });
            port_0q6kaxu7e.onTriggered = () => { innerOut_0q6kaxu7e.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
