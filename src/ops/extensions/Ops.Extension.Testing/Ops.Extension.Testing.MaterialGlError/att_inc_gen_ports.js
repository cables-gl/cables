const port_mvh7lcans = op.inTrigger("mvh7lcans");
port_mvh7lcans.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_mvh7lcans = addedOps[i].outTrigger("innerOut_mvh7lcans");
            innerOut_mvh7lcans.setUiAttribs({ "title": "render" });
            port_mvh7lcans.onTriggered = () => { innerOut_mvh7lcans.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
