const val = op.inValue("Value");
op.varName = op.inValueSelect("Variable");
const inExec = op.inTriggerButton("Set Variable");

op.varName.onChange = updateName;
val.changeAlways = true;

inExec.onTriggered = function ()
{
    update();
};

op.patch.addEventListener("variablesChanged", updateVarNamesDropdown);

updateVarNamesDropdown();

function updateVarNamesDropdown()
{
    if (CABLES.UI)
    {
        const varnames = [];
        const vars = op.patch.getVars();

        for (const i in vars) varnames.push(i);

        varnames.push("+ create new one");
        op.varName.uiAttribs.values = varnames;
    }
}

function updateName()
{
    if (CABLES.UI)
    {
        if (op.varName.get() == "+ create new one")
        {
            CABLES.CMD.PATCH.createVariable(op);
            return;
        }

        op.setTitle("#" + op.varName.get());
    }
    update();
}

function update()
{
    const v = op.patch.setVarValue(op.varName.get(), val.get());
    v.type = "number";
}
