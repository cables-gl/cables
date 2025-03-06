const port_o44faoari = op.inTrigger("o44faoari");
port_o44faoari.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_o44faoari = addedOps[i].outTrigger("innerOut_o44faoari");
            innerOut_o44faoari.setUiAttribs({ "title": "render" });
            port_o44faoari.onTriggered = () => { innerOut_o44faoari.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
