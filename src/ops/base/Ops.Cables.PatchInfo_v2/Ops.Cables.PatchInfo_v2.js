const outConfig = op.outObject("Config");
const outName = op.outString("Name");
const outPatchId = op.outString("Patch Id");
const outNamespace = op.outString("Namespace");
const outSaveDate = op.outNumber("Last Saved");
const outExportDate = op.outNumber("Last Exported");

const patch = getPatch();

outConfig.set(patch.config);
outName.set(patch.name);
outPatchId.set(getPatchId());
outNamespace.set(patch.namespace);
outSaveDate.set(getLastSaveDate());
outExportDate.set(getLastExportDate());

function getPatchId()
{
    let id = null;
    if (patch && patch._id) id = patch._id;
    if (patch && patch.config && patch.config.patch && patch.config.patch._id) id = patch.config.patch._id;
    if (window.gui && window.gui.patchId) id = window.gui.patchId;
    if (window.CABLES && window.CABLES.patchId) id = window.CABLES.patchId;
    if (CABLES.patchId) id = CABLES.patchId;
    return id;
}

function getLastSaveDate()
{
    let date = null;
    if (patch && patch.config && patch.config.patch) date = patch.config.patch.updated;
    if (window.gui && window.gui.project) date = window.gui.project().updated;
    return new Date(date).getTime();
}

function getLastExportDate()
{
    let date = null;
    if (patch && patch.config && patch.config.patch)
    {
        if (patch.config.patch.deployments && patch.config.patch.deployments.lastDeployment)
        {
            date = patch.config.patch.deployments.lastDeployment.date;
        }
    }
    if (window.gui && window.gui.project)
    {
        const p = window.gui.project();
        if (p.deployments && p.deployments.lastDeployment)
        {
            date = p.deployments.lastDeployment.date;
        }
    }
    return new Date(date).getTime();
}

function getPatch()
{
    let thePatch = null;
    if (CABLES && CABLES.exportedPatch) thePatch = CABLES.exportedPatch;
    if (CABLES && CABLES.patch) thePatch = CABLES.patch;
    if (op.patch) thePatch = op.patch;
    return thePatch;
}
