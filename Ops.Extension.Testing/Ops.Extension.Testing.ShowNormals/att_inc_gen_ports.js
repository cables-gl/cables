const port_iyiwyqeey = op.inTrigger("iyiwyqeey");
port_iyiwyqeey.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_iyiwyqeey = addedOps[i].outTrigger("innerOut_iyiwyqeey");
            innerOut_iyiwyqeey.setUiAttribs({ "title": "render" });
            port_iyiwyqeey.onTriggered = () => { innerOut_iyiwyqeey.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
