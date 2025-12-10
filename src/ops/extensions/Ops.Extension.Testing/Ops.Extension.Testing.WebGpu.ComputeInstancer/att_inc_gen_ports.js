const port_x0g812fln = op.inTrigger("x0g812fln");
port_x0g812fln.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_x0g812fln = addedOps[i].outTrigger("innerOut_x0g812fln");
            innerOut_x0g812fln.setUiAttribs({ "title": "exe" });
            port_x0g812fln.onTriggered = () => { innerOut_x0g812fln.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
