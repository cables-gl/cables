const patchId = "blueprint2sub_" + op.id;
new CABLES.SubPatchOp(op, { "subId": patchId });

initializeSubpatch();

function initializeSubpatch()
{
    const p = JSON.parse(attachments.subpatch_json);

    CABLES.Patch.replaceOpIds(p, { "parentSubPatchId": patchId, "prefixHash": patchId, "oldIdAsRef": true, "doNotUnlinkLostLinks": true });

    for (let i = 0; i < p.ops.length; i++)
    {
        p.ops[i].uiAttribs.blueprintSubpatch2 = true;
    }

    if (CABLES.UI)
    {
        let allLoaded = true;
        for (let i = 0; i < p.ops.length; i++)
        {
            const op = p.ops[i];
            if (!gui.serverOps.isLoaded(op))
            {
                allLoaded = false;
                break;
            }
        }

        if (allLoaded)
        {
            finish(p);
        }
        else
        {
            gui.serverOps.loadProjectDependencies(p, () =>
            {
                finish(p);
            });
        }
    }
    else
    {
        finish(p);
    }
}

function finish(p)
{
    op.patch.deSerialize(p);
    op.patch.emitEvent("subpatchExpose", patchId);
    op.setStorage({ "blueprintVer": 2 });
    op.patch.emitEvent("subpatchExpose", patchId);
}
