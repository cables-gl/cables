// op.patchId = op.addInPort(new CABLES.Port(op, "patchId", CABLES.OP_PORT_TYPE_VALUE, { "display": "readonly" }));

// op.patchId.setUiAttribs({ "hideParam": true });

// let oldPatchId = CABLES.generateUUID();
// op.patchId.set(oldPatchId);

new CABLES.SubPatchOp(this);
