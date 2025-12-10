const port_19shyyfqi = op.inTrigger("19shyyfqi");
port_19shyyfqi.setUiAttribs({ "title": "Trigger In", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_19shyyfqi = addedOps[i].outTrigger("innerOut_19shyyfqi");
            innerOut_19shyyfqi.setUiAttribs({ "title": "Trigger In" });
            port_19shyyfqi.onTriggered = () => { innerOut_19shyyfqi.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
