const patchId = "blueprint2sub_" + op.id;
new CABLES.SubPatchOp(op, { "subId": patchId });

initializeSubpatch();

function bp2init()
{
    console.log("blueprint2 init!!!");

    op.setStorage({ "blueprintVer": 2 });
    op.patch.emitEvent("subpatchExpose", patchId);
}

op.on("loadedValueSet", () =>
{
    bp2init();
});

op.on("init", (fromDeserialize) =>
{
    if (!fromDeserialize)
    {
        console.log("init!", fromDeserialize);
        initializeSubpatch();
        bp2init();
    }
});

function initializeSubpatch()
{
    const p = JSON.parse(attachments.subpatch_json);

    CABLES.Patch.replaceOpIds(p, patchId, patchId);

    for (let i = 0; i < p.ops.length; i++)
    {
        p.ops[i].uiAttribs.subPatch = patchId;
        p.ops[i].uiAttribs.blueprintSubpatch2 = true;
    }

    op.patch.deSerialize(p, false, () =>
    {
        op.patch.emitEvent("subpatchExpose", patchId);
    });
}
