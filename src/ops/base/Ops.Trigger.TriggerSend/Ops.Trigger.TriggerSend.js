const trigger = op.inTriggerButton("Trigger");
const varname = op.inValueSelect("Named Trigger", [], "", true);

varname.onChange = updateName;

trigger.onTriggered = doTrigger;

op.patch.addEventListener("namedTriggersChanged", updateVarNamesDropdown);

updateVarNamesDropdown();

function updateVarNamesDropdown()
{
    if (CABLES.UI)
    {
        const varnames = [];
        const vars = op.patch.namedTriggers;
        varnames.push("+ create new one");
        for (const i in vars) varnames.push(i);
        varname.uiAttribs.values = varnames;
    }
}

function updateName()
{
    if (CABLES.UI)
    {
        if (varname.get() == "+ create new one")
        {
        	CABLES.UI.MODAL.prompt("New Trigger", "enter a name for the new trigger", "",
        		function (str)
        		{
        		    varname.set(str);
                    op.patch.namedTriggers[str] = op.patch.namedTriggers[str] || [];
                    updateVarNamesDropdown();
        		});
            return;
        }

        gui.opParams.show(op);
    }

    if (!op.patch.namedTriggers[varname.get()])
    {
        op.patch.namedTriggers[varname.get()] = op.patch.namedTriggers[varname.get()] || [];
        op.patch.emitEvent("namedTriggersChanged");
    }

    op.setTitle(">" + varname.get());

    if (op.isCurrentUiOp()) gui.opParams.show(op);
}

function doTrigger()
{
    const arr = op.patch.namedTriggers[varname.get()];
    // fire an event even if noone is receiving this trigger
    // this way TriggerReceiveFilter can still handle it
    op.patch.emitEvent("namedTriggerSent", varname.get());

    if (!arr)
    {
        op.error("unknown trigger array!", varname.get());
        return;
    }

    for (let i = 0; i < arr.length; i++)
    {
        arr[i]();
    }
}
