const port_jd8puqrj9 = op.inTrigger("jd8puqrj9");
port_jd8puqrj9.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_jd8puqrj9 = addedOps[i].outTrigger("innerOut_jd8puqrj9");
            innerOut_jd8puqrj9.setUiAttribs({ "title": "render" });
            port_jd8puqrj9.onTriggered = () => { innerOut_jd8puqrj9.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
