op.varName=op.inDropDown("Variable",[],"",true);
var val=op.inValueFloat("Value",0);

op.varName.onChange=updateName;
val.onChange=update;
val.changeAlways=true;

op.patch.addEventListener("variablesChanged",updateVarNamesDropdown);

updateVarNamesDropdown();

function updateVarNamesDropdown()
{
    if(CABLES.UI)
    {
        var varnames=[];
        var vars=op.patch.getVars();
        varnames.push('+ create new one');
        for(var i in vars) varnames.push(i);
        op.varName.uiAttribs.values=varnames;
    }
}

function updateName()
{
    if(CABLES.UI)
    {
        if(op.varName.get()=='+ create new one')
        {
            CABLES.CMD.PATCH.createVariable(op);
            return;
        }

        op.setTitle('set #' + op.varName.get());
    }
    update();
}

function update()
{
    op.patch.setVarValue(op.varName.get(),val.get());
}
