const port_1bzb5tho6 = op.inTrigger("1bzb5tho6");
port_1bzb5tho6.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_1bzb5tho6 = addedOps[i].outTrigger("innerOut_1bzb5tho6");
            innerOut_1bzb5tho6.setUiAttribs({ "title": "render" });
            port_1bzb5tho6.onTriggered = () => { innerOut_1bzb5tho6.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
