const port_gingsriom = op.inTrigger("gingsriom");
port_gingsriom.setUiAttribs({ "title": "Input_0", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_gingsriom = addedOps[i].outTrigger("innerOut_gingsriom");
            innerOut_gingsriom.setUiAttribs({ "title": "Input_0" });
            port_gingsriom.onTriggered = () => { innerOut_gingsriom.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
