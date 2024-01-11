const
    inExec = op.inTrigger("Trigger"),
    inName = op.inString("Name", "DefaultArray"),
    inValue = op.inArray("ArrayOps.Team.MEvent_OTjRYN.SidebarEventManagement"),
    outNext = op.outTrigger("Next");

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
    op.patch.stackValuesArr[vName] = op.patch.stackValuesArr[vName] || [];
    op.patch.stackValuesArr[vName].push(inValue.get() || []);

    outNext.trigger();

    op.patch.stackValuesArr[vName].pop();

    if (op.patch.stackValuesArr[vName] && op.patch.stackValuesArr[vName].length == 0) delete op.patch.stackValues[vName];
};
