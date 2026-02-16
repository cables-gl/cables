const
    inExec = op.inTrigger("Trigger"),
    inName = op.inString("Name", "DefaultTexture"),
    inValue = op.inTexture("Texture"),
    outNext = op.outTrigger("Next");

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
    op.patch.stackValuesTex[vName] = op.patch.stackValuesTex[vName] || [];
    op.patch.stackValuesTex[vName].push(inValue.get() || CGL.Texture.getEmptyTexture(op.patch.cgl));

    outNext.trigger();

    op.patch.stackValuesTex[vName].pop();

    if (op.patch.stackValuesTex[vName] && op.patch.stackValuesTex[vName].length == 0) delete op.patch.stackValuesTex[vName];
};
