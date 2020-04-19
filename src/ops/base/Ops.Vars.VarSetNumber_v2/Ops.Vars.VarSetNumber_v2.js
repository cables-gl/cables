op.varName=op.inDropDown("Variable",[],"",true);
const btnCreate=op.inTriggerButton("Create new variable");
const val=op.inValueFloat("Value",0);

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
    if(CABLES.UI)
    {
        var varnames=[];
        var vars=op.patch.getVars();
        for(var i in vars) if(vars[i].type=="number" && i!="0") varnames.push(i);
        op.varName.uiAttribs.values=varnames;
    }
    updateName();
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
    if(vari && !vari.type) vari.type="number";

    update();
}


function update()
{
    op.patch.setVarValue(op.varName.get(),val.get());
}
