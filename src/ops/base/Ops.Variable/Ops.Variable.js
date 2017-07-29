op.name="Variable";

op.varName=op.inValueSelect("Variable");
var val=op.outValue("Value");

var variable=null;
op.patch.addVariableListener(init);
init();

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

op.varName.onChange=function()
{
    init();    
};

function init()
{
    updateVarNamesDropdown();

    if(CABLES.UI)
    {
        if(op.varName.get()=='+ create new one')
        {
            gui.variables.createNew(op);
            return;
        }
    }
    
    if(variable)
    {
        variable.removeListener(onChange);
    }

    variable=op.patch.getVar(op.varName.get());

    if(variable)
    {
        variable.addListener(onChange);
        op.uiAttr({error:null,});
        op.setTitle('#'+op.varName.get());
        op.log("found var"+op.varName.get());
    }
    else
    {
        op.log("not found var "+op.varName.get());
        op.uiAttr(
            {
                error:"unknown variable! - there is no setVariable with this name"
            });
        op.setTitle('?'+op.varName.get());

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