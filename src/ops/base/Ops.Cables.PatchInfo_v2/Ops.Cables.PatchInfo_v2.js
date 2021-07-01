const outConfig = op.outObject("Config");
const outName = op.outString("Name");
const outPatchId = op.outString("Patch Id");
const outNamespace = op.outString("Namespace");

outConfig.set(op.patch.config);
outName.set(op.patch.name);
outPatchId.set(getPatchId());
outNamespace.set(op.patch.namespace);

function getPatchId()
{
    let id = null;
    if (CABLES && CABLES.exportedPatch && CABLES.exportedPatch._id) id = CABLES.exportedPatch._id;
    if (CABLES && CABLES.patch && CABLES.patch.config && CABLES.patch.config.patch && CABLES.patch.config.patch._id) id = CABLES.patch.config.patch._id;
    if (window.gui && window.gui.patchId) id = window.gui.patchId;
    if (window.CABLES && window.CABLES.patchId) id = window.CABLES.patchId;
    if (CABLES.patchId) id = CABLES.patchId;
    if (op.patch && op.patch._id) id = op.patch._id;
    return id;
}
