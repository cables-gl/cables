new CABLES.SubPatchOp(op);

op.setStorage({ "blueprintVer": 2 });

const p = JSON.parse(attachments.subpatch_json);

for (let i = 0; i < p.ops.length; i++)
{
    p.ops[i].uiAttribs.blueprintSubpatch = true;
}

CABLES.Patch.replaceOpIds(p, op.patchId.get());

op.patch.deSerialize(p);
