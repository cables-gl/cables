const port_vhnd3kxi8 = op.inTrigger("vhnd3kxi8");
port_vhnd3kxi8.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_vhnd3kxi8 = addedOps[i].outTrigger("innerOut_vhnd3kxi8");
            innerOut_vhnd3kxi8.setUiAttribs({ "title": "exe" });
            port_vhnd3kxi8.onTriggered = () => { innerOut_vhnd3kxi8.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
