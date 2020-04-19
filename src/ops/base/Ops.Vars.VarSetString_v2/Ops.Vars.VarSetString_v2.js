op.varName=op.inDropDown("Variable",[],"",true);
const btnCreate=op.inTriggerButton("Create new variable");
const val=op.inString("Value","New String");

btnCreate.setUiAttribs({hidePort:true});
btnCreate.onTriggered=createVar;
op.varName.onChange=updateName;
val.onChange=update;
val.changeAlways=true;
op.setPortGroup("Variable",[op.varName,btnCreate]);
op.patch.addEventListener("variablesChanged",updateVarNamesDropdown);
op.init=updateErrorUi;
updateVarNamesDropdown();

function updateErrorUi()
{
    if(CABLES.UI)
    {
        if(!op.varName.get()) op.setUiError('novarname','no variable selected');
        else op.setUiError('novarname',null);
    }
}

function updateVarNamesDropdown()
{
    updateName();

    if(CABLES.UI)
    {
        var varnames=[];
        var vars=op.patch.getVars();
        for(var i in vars) if(vars[i].type=="string" && i!="0") varnames.push(i);
        op.varName.uiAttribs.values=varnames;
    }

}

function createVar()
{
    CABLES.CMD.PATCH.createVariable(op);
    updateName();
}

function updateName()
{
    if(CABLES.UI) op.setTitle('set #' + op.varName.get());
    updateErrorUi();

    const vari=op.patch.getVar(op.varName.get());
    if(vari)vari.type="string";

    update();
}

function update()
{
    if(val.get()!==undefined && val.get()!==null) op.patch.setVarValue(op.varName.get(),val.get());

}

