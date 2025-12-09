const port_xan6v4mbi = op.inTrigger("xan6v4mbi");
port_xan6v4mbi.setUiAttribs({ "title": "exe 6", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_xan6v4mbi = addedOps[i].outTrigger("innerOut_xan6v4mbi");
            innerOut_xan6v4mbi.setUiAttribs({ "title": "exe 6" });
            port_xan6v4mbi.onTriggered = () => { innerOut_xan6v4mbi.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
