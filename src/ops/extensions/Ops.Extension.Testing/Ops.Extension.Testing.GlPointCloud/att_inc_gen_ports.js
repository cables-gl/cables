const port_vp70q69w9 = op.inTrigger("vp70q69w9");
port_vp70q69w9.setUiAttribs({ "title": "Trigger_57", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_vp70q69w9 = addedOps[i].outTrigger("innerOut_vp70q69w9");
            innerOut_vp70q69w9.setUiAttribs({ "title": "Trigger_57" });
            port_vp70q69w9.onTriggered = () => { innerOut_vp70q69w9.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
