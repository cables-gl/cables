new CABLES.SubPatchOp(op);

const p = JSON.parse(attachments.subpatch_json);
CABLES.Patch.replaceOpIds(p, op.patchId.get());

op.patch.deSerialize(p);
