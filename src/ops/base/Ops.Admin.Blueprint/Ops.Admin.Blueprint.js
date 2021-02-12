const patchIdIn = op.inString("externalPatchId", "");
const subPatchIdIn = op.inString("subPatchId", "");
const activeIn = op.inBool("active", false);
const loadingOut = op.outBool("loading");

activeIn.onChange = () =>
{
    if (activeIn.get())
    {
        update();
    }
    else
    {
        removeImportedOps();
    }
};

op.onLoadedValueSet = () =>
{
    if (activeIn.get())
    {
        update();
    }
    else
    {
        removeImportedOps();
    }
};

op.onDelete = removeImportedOps;

function update()
{
    loadingOut.set(true);
    const patch = op.patch;
    const patchId = patchIdIn.get();
    const subPatchId = subPatchIdIn.get();
    const blueprintId = patchId + "-" + subPatchId;
    if (patch.isEditorMode())
    {
        const options = {
            "blueprintId": op.id,
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
                deSerializeBlueprint(blueprintData, subPatchId, true);
            }
            else
            {
                op.setUiError("fetchOps", err);
            }
            loadingOut.set(false);
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
                loadingOut.set(false);
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
