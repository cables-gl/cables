var trigger=op.inTrigger("Trigger");
var varname=op.inValueSelect("Named Trigger");

varname.onChange=updateName;

trigger.onTriggered=doTrigger;

op.patch.addEventListener('namedTriggersChanged',updateVarNamesDropdown);

updateVarNamesDropdown();

function updateVarNamesDropdown()
{
    if(CABLES.UI)
    {
        var varnames=[];
        var vars=op.patch.namedTriggers;
        varnames.push('+ create new one');
        for(var i in vars) varnames.push(i);
        varname.uiAttribs.values=varnames;
    }
}

function updateName()
{
    if(CABLES.UI)
    {
        if(varname.get()=='+ create new one')
        {
        	CABLES.UI.MODAL.prompt("New Trigger","enter a name for the new trigger",'',
        		function(str)
        		{
        		    varname.set(str);
                    op.patch.namedTriggers[str]=op.patch.namedTriggers[str]||[];
                    updateVarNamesDropdown();
        		});
            return;
        }

        gui.patch().showOpParams(op);
    }

    if(!op.patch.namedTriggers[varname.get()])
    {
        op.patch.namedTriggers[varname.get()]=op.patch.namedTriggers[varname.get()]||[];
        op.patch.emitEvent("namedTriggersChanged");
    }

    op.setTitle('>' + varname.get());

    if(CABLES.UI) gui.patch().showOpParams(op);
}

function doTrigger()
{
    var arr=op.patch.namedTriggers[varname.get()];

    if(!arr)
    {
        console.log("unknown trigger array!",varname.get());
        return;
    }

    for(var i=0;i<arr.length;i++)
    {
        arr[i]();
    }
}













