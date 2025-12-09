const port_c5uj0ttk2 = op.inTrigger("c5uj0ttk2");
port_c5uj0ttk2.setUiAttribs({ "title": "Trigger", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_c5uj0ttk2 = addedOps[i].outTrigger("innerOut_c5uj0ttk2");
            innerOut_c5uj0ttk2.setUiAttribs({ "title": "Trigger" });
            port_c5uj0ttk2.onTriggered = () => { innerOut_c5uj0ttk2.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
