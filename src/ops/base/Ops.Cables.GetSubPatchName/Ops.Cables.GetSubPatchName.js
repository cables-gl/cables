// welcome to your new op!
// have a look at the documentation:
// https://cables.gl/docs/5_writing_ops/dev_ops/dev_ops

const
    outName = op.outString("Name");

op.init = update;

op.patch.on("patchLoadEnd", update);

update();

function update()
{
    const outerOp = op.patch.getSubPatchOuterOp(op.uiAttribs.subPatch);

    if (outerOp)
    {
        console.log(outerOp);
        outName.set(outerOp.objName);
        // outName.set(outerOp.shortName);
    }
    else
    {
        console.log("no outerOP?!");
    }
}
