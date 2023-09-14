new CABLES.SubPatchOp(op);

function makeBlueprint()
{
    const bpOp = op.patch.addOp(CABLES.UI.DEFAULTOPNAMES.blueprint);

    bpOp.getPortByName("externalPatchId").set(gui.patchId);
    bpOp.getPortByName("subPatchId").set(op.patchId.get());
    bpOp.getPortByName("active").set(true);

    let attribs =
        {
            "translate":
            {
                "x": op.uiAttribs.translate.x - 150,
                "y": op.uiAttribs.translate.y
            }
        };

    if (CABLES.UI)attribs.subPatch = gui.patchView.getCurrentSubPatch();

    bpOp.uiAttr(attribs);
}

op.on("loadedValueSet",
    () =>
    {
        op.patch.emitEvent("subpatchExpose", op.patchId.get());
    });
