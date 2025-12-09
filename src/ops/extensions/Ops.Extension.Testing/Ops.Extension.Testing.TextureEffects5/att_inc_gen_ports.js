const port_jbltpsguv = op.inTrigger("jbltpsguv");
port_jbltpsguv.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_jbltpsguv = addedOps[i].outTrigger("innerOut_jbltpsguv");
            innerOut_jbltpsguv.setUiAttribs({ "title": "exe" });
            port_jbltpsguv.onTriggered = () => { innerOut_jbltpsguv.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
