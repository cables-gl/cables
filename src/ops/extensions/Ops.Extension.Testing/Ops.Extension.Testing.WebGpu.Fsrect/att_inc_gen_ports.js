const port_kkegpk5gs = op.inTrigger("kkegpk5gs");
port_kkegpk5gs.setUiAttribs({ "title": "Render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_kkegpk5gs = addedOps[i].outTrigger("innerOut_kkegpk5gs");
            innerOut_kkegpk5gs.setUiAttribs({ "title": "Render" });
            port_kkegpk5gs.onTriggered = () => { innerOut_kkegpk5gs.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
