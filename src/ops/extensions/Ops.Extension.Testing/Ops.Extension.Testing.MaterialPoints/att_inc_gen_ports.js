const port_ry8b92ii7 = op.inTrigger("ry8b92ii7");
port_ry8b92ii7.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_ry8b92ii7 = addedOps[i].outTrigger("innerOut_ry8b92ii7");
            innerOut_ry8b92ii7.setUiAttribs({ "title": "render" });
            port_ry8b92ii7.onTriggered = () => { innerOut_ry8b92ii7.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
