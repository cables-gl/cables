op.varName = op.inValueSelect("Variable", [], "", true);
const val = op.outArray("Array");

let variable = null;
// op.patch.addVariableListener(init);
op.patch.addEventListener("variablesChanged", init);

init();

updateVarNamesDropdown();

function updateVarNamesDropdown()
{
    if (CABLES.UI)
    {
        const varnames = [];
        const vars = op.patch.getVars();

        for (const i in vars) if (i != "0" && vars[i].type == "array") varnames.push(i);

        // varnames.push('+ create new one');
        op.varName.uiAttribs.values = varnames;
    }
}

op.varName.onChange = function ()
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

    if (variable)
    {
        variable.removeListener(onChange);
    }

    variable = op.patch.getVar(op.varName.get());

    if (variable)
    {
        variable.addListener(onChange);
        op.uiAttr({ "error": null, });
        op.setTitle("#" + op.varName.get());
        onChange(variable.getValue());
    }
    else
    {
        op.uiAttr({ "error": "unknown variable! - there is no setVariable with this name" });
        op.setTitle("#invalid");
    }
}


function onChange(v)
{
    updateVarNamesDropdown();
    val.set(v);
}

op.onDelete = function ()
{
    if (variable)
        variable.removeListener(onChange);
};
