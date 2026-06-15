const
    searchStr = op.inString("Tag"),
    result = op.outArray("Result");

let soon = null;

op.patch.on("patchLoadEnd", updateStatusSoon);
op.patch.on(CABLES.Patch.EVENT_OP_DELETED, updateStatusSoon);
op.patch.on(CABLES.Patch.EVENT_VALUESSET, updateStatusSoon);
op.patch.on(CABLES.Patch.EVENT_PATCHLOADEND, updateStatusSoon);

function updateStatusSoon()
{
    soon = CABLES.idleCallbackSoon(soon, updateStatus);
}

searchStr.onChange = () =>
{
    op.setUiAttribs({ "extendTitle": searchStr.get() });

    updateStatus();
};

function updateStatus()
{
    const r = [];
    const ops = op.patch.ops;
    for (let i = 0; i < ops.length; i++)
    {
        if (ops[i].attribs.tags && ops[i].attribs.tags.includes(searchStr.get()))
            r.push(ops[i]);
    }
    result.setRef(r);
}
