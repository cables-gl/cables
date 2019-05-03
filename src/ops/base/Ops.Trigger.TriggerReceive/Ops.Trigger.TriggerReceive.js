const next=op.outTrigger("Triggered");
var varname=op.inValueSelect("Named Trigger");

updateVarNamesDropdown();
op.patch.addEventListener('namedTriggersChanged',updateVarNamesDropdown);


var oldName=null;

function doTrigger()
{
    next.trigger();
};


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

varname.onChange=function()
{

    if(oldName)
    {
        var oldCbs=op.patch.namedTriggers[oldName];
        var a=oldCbs.indexOf(doTrigger);
        if(a!=-1) oldCbs.splice(a,1);
    }

    op.setTitle('>' + varname.get());
    op.patch.namedTriggers[varname.get()]=op.patch.namedTriggers[varname.get()]||[];
    var cbs=op.patch.namedTriggers[varname.get()];

    cbs.push(doTrigger);
    oldName=varname.get();
};

