const port_gegfvhfc3 = op.inTrigger("gegfvhfc3");
port_gegfvhfc3.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_gegfvhfc3 = addedOps[i].outTrigger("innerOut_gegfvhfc3");
            innerOut_gegfvhfc3.setUiAttribs({ "title": "exe" });
            port_gegfvhfc3.onTriggered = () => { innerOut_gegfvhfc3.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
