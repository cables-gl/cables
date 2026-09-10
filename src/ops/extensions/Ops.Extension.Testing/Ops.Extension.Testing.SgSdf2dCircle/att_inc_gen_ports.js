const port_n6afi71yd = op.inTrigger("n6afi71yd");
port_n6afi71yd.setUiAttribs({ "title": "render" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_n6afi71yd = addedOps[i].outTrigger("innerOut_n6afi71yd");
            innerOut_n6afi71yd.setUiAttribs({ "title": "render" });
            port_n6afi71yd.onTriggered = () => { innerOut_n6afi71yd.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
