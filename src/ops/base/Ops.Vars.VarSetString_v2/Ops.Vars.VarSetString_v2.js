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
    if(CABLES.UI)
    {
        var varnames=[];
        var vars=op.patch.getVars();
        for(var i in vars) if(i!="0") varnames.push(i);
        op.varName.uiAttribs.values=varnames;
    }
}

function createVar()
{
    CABLES.CMD.PATCH.createVariable(op);
}

function updateName()
{
    if(CABLES.UI) op.setTitle('set #' + op.varName.get());
    updateErrorUi();
    update();
}

function update()
{
    // op.patch.setVarValue(op.varName.get(),val.get());
    if(val.get()!==undefined && val.get()!==null) op.patch.setVarValue(op.varName.get(),val.get());

}


// op.varName=op.inValueSelect("Variable",[],"",true);
// var val=op.inString("Value",'New String');

// op.varName.onChange=updateName;
// val.onChange=update;
// val.changeAlways=true;

// op.patch.addEventListener("variablesChanged",updateVarNamesDropdown);

// updateVarNamesDropdown();

// function updateVarNamesDropdown()
// {
//     if(CABLES.UI)
//     {
//         var varnames=[];
//         var vars=op.patch.getVars();
//         varnames.push('+ create new one');
//         for(var i in vars) varnames.push(i);
//         op.varName.uiAttribs.values=varnames;
//     }
// }

// function updateName()
// {
//     if(CABLES.UI)
//     {
//         if(op.varName.get()=='+ create new one')
//         {
//             CABLES.CMD.PATCH.createVariable(op);
//             return;
//         }

//         op.setTitle('set #' + op.varName.get());
//     }
//     update();
// }

// function update()
// {
//     if(val.get()!==undefined && val.get()!==null) op.patch.setVarValue(op.varName.get(),val.get());
// }
