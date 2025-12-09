const port_z6qfzqhdl = op.inTrigger("z6qfzqhdl");
port_z6qfzqhdl.setUiAttribs({ "title": "exe", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_z6qfzqhdl = addedOps[i].outTrigger("innerOut_z6qfzqhdl");
            innerOut_z6qfzqhdl.setUiAttribs({ "title": "exe" });
            port_z6qfzqhdl.onTriggered = () => { innerOut_z6qfzqhdl.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
