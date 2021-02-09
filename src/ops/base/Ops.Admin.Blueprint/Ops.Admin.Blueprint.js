const patchIdIn = op.inString("externalPatchId", "");
const subPatchIdIn = op.inString("subPatchId", "");
const reloadTriggerIn = op.inTriggerButton("reload");

reloadTriggerIn.onTriggered = update;
op.onLoadedValueSet = update;
op.onDelete = removeImportedOps;

function update()
{
    const patch = op.patch;
    const patchId = patchIdIn.get();
    const subPatchId = subPatchIdIn.get();
    const blueprintId = patchId + "-" + subPatchId;
    if (patch.isEditorMode())
    {
        const options = {
            "patchId": patchId,
            "subPatchId": subPatchId
        };
        CABLES.sandbox.getBlueprintOps(options, (err, blueprintData) =>
        {
            op.setUiError("fetchOps", null);
            if (!err)
            {
                removeImportedOps();
                blueprintData.settings = op.patch.settings;
                blueprintData.ops = blueprintData.msg;
                blueprintData.ops.forEach((subOp) =>
                {
                    subOp.uiAttribs.blueprintId = op.id;
                });
                deSerializeBlueprint(blueprintData, subPatchId, true);
            }
            else
            {
                op.setUiError("fetchOps", err);
            }
        });
    }
    else
    {
        const blueprintUrl = "js/" + blueprintId + ".json";
        CABLES.ajax(
            blueprintUrl,
            function (err, data)
            {
                if (!err)
                {
                    const blueprint = JSON.parse(data);
                    deSerializeBlueprint(blueprint, subPatchId, false);
                }
                else
                {
                    op.error("failed to load blueprint from", blueprintUrl, err);
                }
            }
        );
    }
}

function deSerializeBlueprint(data, subPatchId, editorMode)
{
    if (Array.isArray(data.ops) && data.ops.length > 0)
    {
        if (editorMode)
        {
            gui.serverOps.loadProjectLibs(data, () =>
            {
                op.patch.deSerialize(data, false);
                gui.patchView.setCurrentSubPatch(subPatchId);
                gui.patchView.setCurrentSubPatch(0);
            });
        }
        else
        {
            op.patch.deSerialize(data, false);
        }
    }
}

function removeImportedOps()
{
    const opsToDelete = [];
    op.patch.ops.forEach((subOp) =>
    {
        if (subOp.uiAttribs.blueprintId === op.id)
        {
            opsToDelete.push(subOp.id);
        }
    });
    opsToDelete.forEach((toDelete) =>
    {
        op.patch.deleteOp(toDelete);
    });
}
