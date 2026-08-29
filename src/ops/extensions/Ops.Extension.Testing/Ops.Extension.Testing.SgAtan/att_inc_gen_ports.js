const port_4k6o9el7e = op.inTrigger("4k6o9el7e");
port_4k6o9el7e.setUiAttribs({ "title": "Render" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_4k6o9el7e = addedOps[i].outTrigger("innerOut_4k6o9el7e");
            innerOut_4k6o9el7e.setUiAttribs({ "title": "Render" });
            port_4k6o9el7e.onTriggered = () => { innerOut_4k6o9el7e.trigger(); };

        }
        if (addedOps[i].innerOutput)
        {}
    }
};
