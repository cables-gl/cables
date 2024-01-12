const
    inExec = op.inTrigger("Exec"),
    inName = op.inString("Name", "Default"),
    outNext = op.outTrigger("Next"),
    outValue = op.outNumber("Value", 0);

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
        outValue.set(op.patch.stackValues[vName][op.patch.stackValues[vName].length - 1]);
    else
        outValue.set(0);

    outNext.trigger();
};
