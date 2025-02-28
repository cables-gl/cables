const port_24wczq4w3 = op.inTrigger("24wczq4w3");
port_24wczq4w3.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_24wczq4w3 = addedOps[i].outTrigger("innerOut_24wczq4w3");
            innerOut_24wczq4w3.setUiAttribs({ "title": "exe" });
            port_24wczq4w3.onTriggered = () => { innerOut_24wczq4w3.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
