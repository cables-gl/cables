new CABLES.SubPatchOp(op);

let oldPatchId = op.patchId.get();
let initialized = false;

console.log(oldPatchId);

op.setStorage({ "blueprintVer": 2 });

console.log("deSerialized", op.patch.deSerialized);

initializeSubpatch();

op.on("loadedValueSet", () =>
{
    if (oldPatchId != op.patchId.get()) moveOpsSubpatches(oldPatchId, op.patchId.get());
    oldPatchId = op.patchId.get();
});

op.on("init", (fromDeserialize) =>
{
    if (!fromDeserialize)
    {
        console.log("init!", fromDeserialize);
        initializeSubpatch();
    }
});

function initializeSubpatch()
{
    if (initialized) return;
    initialized = true;
    console.log("bp2 initializeSubpatch");
    const p = JSON.parse(attachments.subpatch_json);

    for (let i = 0; i < p.ops.length; i++)
    {
        // p.ops[i].uiAttribs.blueprintSubpatch = true;
        p.ops[i].uiAttribs.blueprintSubpatch2 = true;
    }

    oldPatchId = p.ops[0].uiAttribs.subPatch;
    console.log("op.patchId.get()", op.patchId.get());

    op.patch.deSerialize(p);
}

function moveOpsSubpatches(src, dst)
{
    const ops = op.patch.ops;
    const deleteOps = [];

    for (let i = 0; i < ops.length; i++)
    {
        if (ops[i].uiAttribs.subPatch == src)
        {
            if (ops[i].objName.indexOf("PatchOutput") > -1 || ops[i].objName.indexOf("PatchInput") > -1)
                deleteOps.push(ops[i].id);

            ops[i].setUiAttrib({ "subPatch": dst });
        }
        console.log(i, ops[i].uiAttribs.subPatch);
    }

    deleteOps.forEach((opid) =>
    {
        console.log(op);
        op.patch.deleteOp(opid);
    });

    op.patch.emitEvent("subpatchExpose", dst);
}
