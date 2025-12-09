const port_bv89n4hio = op.inTrigger("bv89n4hio");
port_bv89n4hio.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_bv89n4hio = addedOps[i].outTrigger("innerOut_bv89n4hio");
            innerOut_bv89n4hio.setUiAttribs({ "title": "exe" });
            port_bv89n4hio.onTriggered = () => { innerOut_bv89n4hio.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
