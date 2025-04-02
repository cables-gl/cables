const port_zueqdoz7i = op.inTrigger("zueqdoz7i");
port_zueqdoz7i.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_zueqdoz7i = addedOps[i].outTrigger("innerOut_zueqdoz7i");
            innerOut_zueqdoz7i.setUiAttribs({ "title": "render" });
            port_zueqdoz7i.onTriggered = () => { innerOut_zueqdoz7i.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
