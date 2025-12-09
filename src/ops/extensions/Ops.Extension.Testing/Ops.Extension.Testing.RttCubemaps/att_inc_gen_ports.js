const port_48k2xaj9e = op.inTrigger("48k2xaj9e");
port_48k2xaj9e.setUiAttribs({ "title": "add port", });

const port_e29uthtcy = op.inTrigger("e29uthtcy");
port_e29uthtcy.setUiAttribs({ "title": "Execute", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_48k2xaj9e = addedOps[i].outTrigger("innerOut_48k2xaj9e");
            innerOut_48k2xaj9e.setUiAttribs({ "title": "add port" });
            port_48k2xaj9e.onTriggered = () => { innerOut_48k2xaj9e.trigger(); };

            const innerOut_e29uthtcy = addedOps[i].outTrigger("innerOut_e29uthtcy");
            innerOut_e29uthtcy.setUiAttribs({ "title": "Execute" });
            port_e29uthtcy.onTriggered = () => { innerOut_e29uthtcy.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
