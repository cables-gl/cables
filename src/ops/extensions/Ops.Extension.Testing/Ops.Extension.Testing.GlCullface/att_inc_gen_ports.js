const port_drjqxb2ae = op.inTrigger("drjqxb2ae");
port_drjqxb2ae.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_drjqxb2ae = addedOps[i].outTrigger("innerOut_drjqxb2ae");
            innerOut_drjqxb2ae.setUiAttribs({ "title": "render" });
            port_drjqxb2ae.onTriggered = () => { innerOut_drjqxb2ae.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
