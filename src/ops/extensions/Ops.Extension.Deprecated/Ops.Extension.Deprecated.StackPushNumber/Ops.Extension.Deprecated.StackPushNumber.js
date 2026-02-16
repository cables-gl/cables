const
    inExec = op.inTrigger("Exec"),
    inName = op.inString("Name", "Default"),
    inValue = op.inFloat("Value", 0),
    outNext = op.outTrigger("Next");

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
    op.patch.stackValues[vName] = op.patch.stackValues[vName] || [];
    op.patch.stackValues[vName].push(inValue.get());

    outNext.trigger();

    op.patch.stackValues[vName].pop();

    if (op.patch.stackValues[vName] && op.patch.stackValues[vName].length == 0) delete op.patch.stackValues[vName];
};
