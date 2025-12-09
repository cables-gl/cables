const port_x7cr93vn5 = op.inTrigger("x7cr93vn5");
port_x7cr93vn5.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_x7cr93vn5 = addedOps[i].outTrigger("innerOut_x7cr93vn5");
            innerOut_x7cr93vn5.setUiAttribs({ "title": "render" });
            port_x7cr93vn5.onTriggered = () => { innerOut_x7cr93vn5.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
