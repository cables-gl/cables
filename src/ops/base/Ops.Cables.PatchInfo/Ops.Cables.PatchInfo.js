const outConfig = op.outObject("Config");
const outName = op.outValueString("Name");
const outPatchId = op.outValueString("Patch Id");
const outNamespace = op.outValueString("Namespace");

outConfig.set(op.patch.config);
outName.set(op.patch.name);
outPatchId.set(op.patch._id);
outNamespace.set(op.patch.namespace);
