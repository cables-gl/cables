const
    inExec = op.inTrigger("Trigger"),
    inName = op.inString("Name", "DefaultTexture"),
    outNext = op.outTrigger("Next"),
    outValue = op.outArray("Array");

op.patch.stackValuesArr = op.patch.stackValuesArr || {};

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
    if (op.patch.stackValuesArr.hasOwnProperty(vName) && op.patch.stackValuesArr[vName].length > 0)
        outValue.setRef(op.patch.stackValuesArr[vName][op.patch.stackValuesArr[vName].length - 1]);
    else
        outValue.setRef([]);

    outNext.trigger();
};
