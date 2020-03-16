var val=op.outValue("Value");
op.varName=op.inValueSelect("Variable",[],"",true);

var variable=null;
op.patch.addEventListener("variablesChanged",init);

init();

updateVarNamesDropdown();

function updateVarNamesDropdown()
{
    if(CABLES.UI)
    {
        var varnames=[];
        var vars=op.patch.getVars();

        for(var i in vars)
            if(typeof vars[i].getValue()=="number" || typeof vars[i].getValue()=="boolean")
                varnames.push(i);

        op.varName.uiAttribs.values=varnames;
    }
}

op.varName.onChange=function()
{
    init();
};

function init()
{
    updateVarNamesDropdown();

    // if(CABLES.UI)
    // {
    //     if(op.varName.get()=='+ create new one')
    //     {
    //         CABLES.CMD.PATCH.createVariable(op);
    //         return;
    //     }
    // }

    if(variable)
    {
        variable.removeListener(onChange);
    }

    variable=op.patch.getVar(op.varName.get());

    if(variable)
    {
        variable.addListener(onChange);
        op.setUiError("unknownvar",null);
        op.setTitle('#'+op.varName.get());
        onChange(variable.getValue());
        // console.log("var value ",variable.getName(),variable.getValue());
    }
    else
    {
        op.setUiError("unknownvar","unknown variable! - there is no setVariable with this name ("+op.varName.get()+")");
        op.setTitle('#invalid');
    }
}


function onChange(v)
{
    updateVarNamesDropdown();
    val.set(v);
}

op.onDelete=function()
{
    if(variable)
        variable.removeListener(onChange);
};
