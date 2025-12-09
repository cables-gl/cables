const port_6a963im08 = op.inTrigger("6a963im08");
port_6a963im08.setUiAttribs({ "title": "Update", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_6a963im08 = addedOps[i].outTrigger("innerOut_6a963im08");
            innerOut_6a963im08.setUiAttribs({ "title": "Update" });
            port_6a963im08.onTriggered = () => { innerOut_6a963im08.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
