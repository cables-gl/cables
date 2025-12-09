const port_0j8itoh06 = op.inTrigger("0j8itoh06");
port_0j8itoh06.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_0j8itoh06 = addedOps[i].outTrigger("innerOut_0j8itoh06");
            innerOut_0j8itoh06.setUiAttribs({ "title": "render" });
            port_0j8itoh06.onTriggered = () => { innerOut_0j8itoh06.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
