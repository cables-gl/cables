new CABLES.SubPatchOp(op);

op.on("loadedValueSet",
    () =>
    {
        op.patch.emitEvent("subpatchExpose", op.patchId.get());
    });
