const next = op.outTrigger("Triggered");
let varname = op.inValueSelect("Named Trigger", [], "", true);

updateVarNamesDropdown();
op.patch.addEventListener("namedTriggersChanged", updateVarNamesDropdown);

let oldName = null;

function doTrigger()
{
    next.trigger();
}

function updateVarNamesDropdown()
{
    if (CABLES.UI)
    {
        let varnames = [];
        let vars = op.patch.namedTriggers;
        // varnames.push('+ create new one');
        for (let i in vars) varnames.push(i);
        varname.uiAttribs.values = varnames;
    }
}

varname.onChange = function ()
{
    if (oldName)
    {
        let oldCbs = op.patch.namedTriggers[oldName];
        let a = oldCbs.indexOf(doTrigger);
        if (a != -1) oldCbs.splice(a, 1);
    }

    op.setTitle(">" + varname.get());
    op.patch.namedTriggers[varname.get()] = op.patch.namedTriggers[varname.get()] || [];
    let cbs = op.patch.namedTriggers[varname.get()];

    cbs.push(doTrigger);
    oldName = varname.get();
};
