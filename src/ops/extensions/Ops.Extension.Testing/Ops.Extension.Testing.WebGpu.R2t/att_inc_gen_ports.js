const port_i6rbmf1c7 = op.inTrigger("i6rbmf1c7");
port_i6rbmf1c7.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_i6rbmf1c7 = addedOps[i].outTrigger("innerOut_i6rbmf1c7");
            innerOut_i6rbmf1c7.setUiAttribs({ "title": "exe" });
            port_i6rbmf1c7.onTriggered = () => { innerOut_i6rbmf1c7.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
