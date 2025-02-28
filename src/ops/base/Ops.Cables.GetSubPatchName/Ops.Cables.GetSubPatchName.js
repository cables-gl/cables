const
    outName = op.outString("Name"),
    outShortName = op.outString("ShortName");

op.init = update;

op.patch.on("patchLoadEnd", update);
op.patch.on("opReloaded", update);

update();

function update()
{
    let outerOp = op.uiAttribs.subPatch;

    if (CABLES.UI)
        outerOp = op.patch.getSubPatchOuterOp(op.uiAttribs.subPatch);

    if (outerOp && outerOp.objName)
    {
        outName.set(outerOp.objName);

        const parts = outerOp.objName.split(".");
        outShortName.set(parts.at(-1));
    }
    else
    {
        setTimeout(() =>
        {
            update();
        }, 100);

    }
}
