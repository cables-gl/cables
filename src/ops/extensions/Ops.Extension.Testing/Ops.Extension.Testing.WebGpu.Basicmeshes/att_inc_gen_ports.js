const port_ul6di6734 = op.inTrigger("ul6di6734");
port_ul6di6734.setUiAttribs({ "title": "Render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_ul6di6734 = addedOps[i].outTrigger("innerOut_ul6di6734");
            innerOut_ul6di6734.setUiAttribs({ "title": "Render" });
            port_ul6di6734.onTriggered = () => { innerOut_ul6di6734.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
