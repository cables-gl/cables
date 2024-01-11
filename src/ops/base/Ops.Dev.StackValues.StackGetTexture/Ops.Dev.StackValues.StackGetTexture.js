const
    inExec = op.inTrigger("Exec"),
    inName = op.inString("Name", "DefaultTexture"),
    outNext = op.outTrigger("Next"),
    outValue = op.outTexture("Texture");

op.patch.stackValues = op.patch.stackValues || {};

let vName = "";

inName.onChange = updateName;
updateName();

function updateName()
{
    vName = inName.get();
    op.setUiAttrib({ "extendTitle": vName });
}

inExec.onTriggered = () =>
{
    if (op.patch.stackValues.hasOwnProperty(vName) && op.patch.stackValues[vName].length > 0)
        outValue.setRef(op.patch.stackValues[vName][op.patch.stackValues[vName].length - 1]);
    else
        outValue.setRef(CGL.Texture.getEmptyTexture(op.patch.cgl));

    outNext.trigger();
};
