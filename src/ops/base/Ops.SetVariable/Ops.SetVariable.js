op.name="SetVariable";

op.varName=op.inValueSelect("Variable");
var val=op.inValue("Value");
var outVal=op.outValue("Value");

op.varName.onChange=updateName;
val.onChange=update;

op.patch.addVariableListener(updateVarNamesDropdown);

updateVarNamesDropdown();

function updateVarNamesDropdown()
{
    if(CABLES.UI)
    {
        var varnames=[];
        var vars=op.patch.getVars();

        for(var i in vars) varnames.push(i);

        varnames.push('+ create new one');
        op.varName.uiAttribs.values=varnames;
    }
}

function updateName()
{
    if(CABLES.UI)
    {
        if(op.varName.get()=='+ create new one')
        {
            gui.variables.createNew(op);
            return;
        }

        console.log("setting new title,",op.varName.get());
        op.setTitle('#'+op.varName.get());

    }
    update();
}

function update()
{
    op.patch.setVarValue(op.varName.get(),val.get());
    outVal.set(val.get());
}

