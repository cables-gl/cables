const port_i3lmrdw4p = op.inTrigger("i3lmrdw4p");
port_i3lmrdw4p.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_i3lmrdw4p = addedOps[i].outTrigger("innerOut_i3lmrdw4p");
            innerOut_i3lmrdw4p.setUiAttribs({ "title": "render" });
            port_i3lmrdw4p.onTriggered = () => { innerOut_i3lmrdw4p.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
