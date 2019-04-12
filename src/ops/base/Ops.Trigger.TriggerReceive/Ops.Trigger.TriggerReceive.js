
const next=op.outTrigger("Triggered");
var varname=op.inValueSelect("Named Trigger");

updateVarNamesDropdown();
op.patch.addEventListener('namedTriggersChanged',updateVarNamesDropdown);


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
    op.setTitle('>' + varname.get());

    var cbs=op.patch.namedTriggers[varname.get()]||[];

    cbs.push(doTrigger);
};

function doTrigger()
{
    next.trigger();
}
