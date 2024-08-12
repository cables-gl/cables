const port_si0ni96ke = op.inTrigger("si0ni96ke");
port_si0ni96ke.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_si0ni96ke = addedOps[i].outTrigger("innerOut_si0ni96ke");
            innerOut_si0ni96ke.setUiAttribs({ "title": "exe" });
            port_si0ni96ke.onTriggered = () => { innerOut_si0ni96ke.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
