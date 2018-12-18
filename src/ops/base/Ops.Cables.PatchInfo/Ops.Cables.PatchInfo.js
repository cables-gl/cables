
const outConfig=op.outObject('Config');
const outName=op.outValueString('Name');
const outNamespace=op.outValueString('Namespace');

outConfig.set(op.patch.config);
outName.set(op.patch.name);
outNamespace.set(op.patch.namespace);
