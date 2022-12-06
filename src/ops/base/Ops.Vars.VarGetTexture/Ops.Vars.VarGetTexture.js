op.varName = op.inValueSelect("Variable", [], "", true);
let val = op.outTexture("Object");

let variable = null;
let changeListenerId = null;

op.patch.addEventListener("variablesChanged", init);

init();

updateVarNamesDropdown();

function updateVarNamesDropdown()
{
    if (CABLES.UI)
    {
        let varnames = [];
        let vars = op.patch.getVars();

        for (let i in vars)
            if (typeof vars[i].getValue() == "object")
                varnames.push(i);

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

    if (variable && changeListenerId) variable.off(changeListenerId);

    variable = op.patch.getVar(op.varName.get());

    if (variable)
    {
        changeListenerId = variable.on("change", onChange);
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
    if (variable && changeListenerId) variable.off(changeListenerId);
};
