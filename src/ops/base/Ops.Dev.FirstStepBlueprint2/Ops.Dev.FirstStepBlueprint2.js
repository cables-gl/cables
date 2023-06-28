const patchId = "subpatch_" + op.id;
new CABLES.SubPatchOp(op, { "subId": patchId });

let initialized = false;

initializeSubpatch();

function bp2init()
{
    console.log("blueprint2 init!!!");
    // if (oldPatchId != op.patchId.get()) moveOpsSubpatches(oldPatchId, op.patchId.get());
    // oldPatchId = op.patchId.get();

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
    if (initialized) return;
    initialized = true;
    console.log("bp2 initializeSubpatch");
    const p = JSON.parse(attachments.subpatch_json);

    CABLES.Patch.replaceOpIds(p, patchId);

    for (let i = 0; i < p.ops.length; i++)
    {
        p.ops[i].uiAttribs.subPatch = patchId;
        p.ops[i].uiAttribs.blueprintSubpatch2 = true;
    }

    // oldPatchId = p.ops[0].uiAttribs.subPatch;
    console.log("op.patchId.get()", op.patchId.get());

    op.patch.deSerialize(p, false, () =>
    {
        op.patch.emitEvent("subpatchExpose", patchId);
    });
}

// function moveOpsSubpatches(src, dst)
// {
//     const ops = op.patch.ops;
//     const deleteOps = [];

//     for (let i = 0; i < ops.length; i++)
//     {
//         if (ops[i].uiAttribs.subPatch == src)
//         {
//             if (ops[i].objName.indexOf("PatchOutput") > -1 || ops[i].objName.indexOf("PatchInput") > -1)
//                 deleteOps.push(ops[i].id);

//             ops[i].setUiAttrib({ "subPatch": dst });
//         }
//         console.log(i, ops[i].uiAttribs.subPatch);
//     }

//     deleteOps.forEach((opid) =>
//     {
//         console.log(op);
//         op.patch.deleteOp(opid);
//     });

//     op.patch.emitEvent("subpatchExpose", dst);
// }
