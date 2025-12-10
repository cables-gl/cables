const port_c3ptroons = op.inTrigger("c3ptroons");
port_c3ptroons.setUiAttribs({ "title": "Render", "display": "button", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_c3ptroons = addedOps[i].outTrigger("innerOut_c3ptroons");
            innerOut_c3ptroons.setUiAttribs({ "title": "Render" });
            port_c3ptroons.onTriggered = () => { innerOut_c3ptroons.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
