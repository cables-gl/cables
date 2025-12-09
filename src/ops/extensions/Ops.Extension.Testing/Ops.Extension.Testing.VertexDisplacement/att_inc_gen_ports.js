const port_qpmomvgd9 = op.inTrigger("qpmomvgd9");
port_qpmomvgd9.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_qpmomvgd9 = addedOps[i].outTrigger("innerOut_qpmomvgd9");
            innerOut_qpmomvgd9.setUiAttribs({ "title": "exe" });
            port_qpmomvgd9.onTriggered = () => { innerOut_qpmomvgd9.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
