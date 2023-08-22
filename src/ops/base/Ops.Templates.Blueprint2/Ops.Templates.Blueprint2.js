const patchId = "blueprint2sub_" + op.id;
new CABLES.SubPatchOp(op, { "subId": patchId });

initializeSubpatch();

function bp2init()
{
    op.setStorage({ "blueprintVer": 2 });
    op.patch.emitEvent("subpatchExpose", patchId);
}

function initializeSubpatch()
{
    const p = JSON.parse(attachments.subpatch_json);

    CABLES.Patch.replaceOpIds(p, { "parentSubPatchId": patchId, "prefixHash": patchId, "oldIdAsRef": true });

    for (let i = 0; i < p.ops.length; i++)
    {
        // p.ops[i].uiAttribs.subPatch = patchId;
        p.ops[i].uiAttribs.blueprintSubpatch2 = true;
    }

    op.patch.deSerialize(p);
    finish();
}

function finish()
{
    op.patch.emitEvent("subpatchExpose", patchId);
    bp2init();
}
