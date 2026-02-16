const
    inExec = op.inTrigger("Exec"),
    inName = op.inString("Name", "DefaultTexture"),
    outNext = op.outTrigger("Next"),
    outValue = op.outTexture("Texture");

op.patch.stackValuesTex = op.patch.stackValuesTex || {};

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
    if (op.patch.stackValuesTex.hasOwnProperty(vName) && op.patch.stackValuesTex[vName].length > 0)
        outValue.setRef(op.patch.stackValuesTex[vName][op.patch.stackValuesTex[vName].length - 1]);
    else
        outValue.setRef(CGL.Texture.getEmptyTexture(op.patch.cgl));

    outNext.trigger();
};
