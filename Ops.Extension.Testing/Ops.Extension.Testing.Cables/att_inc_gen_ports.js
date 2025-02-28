const port_zouv6d394 = op.inTrigger("zouv6d394");
port_zouv6d394.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_zouv6d394 = addedOps[i].outTrigger("innerOut_zouv6d394");
            innerOut_zouv6d394.setUiAttribs({ "title": "render" });
            port_zouv6d394.onTriggered = () => { innerOut_zouv6d394.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
