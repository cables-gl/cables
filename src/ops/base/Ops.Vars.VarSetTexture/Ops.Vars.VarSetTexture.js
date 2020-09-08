op.varName = op.inDropDown("Variable", [], "", true);
const btnCreate = op.inTriggerButton("Create new variable");
const val = op.inObject("Object", 0);

btnCreate.setUiAttribs({ "hidePort": true });
btnCreate.onTriggered = createVar;
op.varName.onChange = updateName;
val.onChange = update;
val.changeAlways = true;
op.setPortGroup("Variable", [op.varName, btnCreate]);
op.patch.addEventListener("variablesChanged", updateVarNamesDropdown);
op.init = updateErrorUi;
updateVarNamesDropdown();

function updateErrorUi()
{
    if (CABLES.UI)
    {
        if (!op.varName.get()) op.setUiError("novarname", "no variable selected");
        else op.setUiError("novarname", null);
    }
}

function updateVarNamesDropdown()
{
    if (CABLES.UI)
    {
        const varnames = [];
        const vars = op.patch.getVars();
        for (const i in vars) if (i != "0") varnames.push(i);
        op.varName.uiAttribs.values = varnames;
    }
}

function createVar()
{
    CABLES.CMD.PATCH.createVariable(op);
}

function updateName()
{
    if (CABLES.UI) op.setTitle("set #" + op.varName.get());
    updateErrorUi();
    update();
}

function update()
{
    // op.patch.setVarValue(op.varName.get(), CGL.Texture.getEmptyTexture(op.patch.cgl));
    op.patch.setVarValue(op.varName.get(), val.get());
}
