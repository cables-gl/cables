const port_01760bjtw = op.inTrigger("01760bjtw");
port_01760bjtw.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_01760bjtw = addedOps[i].outTrigger("innerOut_01760bjtw");
            innerOut_01760bjtw.setUiAttribs({ "title": "exe" });
            port_01760bjtw.onTriggered = () => { innerOut_01760bjtw.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
