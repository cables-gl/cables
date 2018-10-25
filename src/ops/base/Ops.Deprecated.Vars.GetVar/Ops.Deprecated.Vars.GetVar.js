
op.name='get var';

var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));

var varname=op.addInPort(new CABLES.Port(op,"name",CABLES.OP_PORT_TYPE_VALUE,{type:'string'}));
var val=op.addOutPort(new CABLES.Port(op,"val",CABLES.OP_PORT_TYPE_VALUE));
var defaultValue=op.inValue("Default Value",0);

val.ignoreValueSerialize=true;

function updateVar()
{
    if(op.patch.vars && op.patch.vars.hasOwnProperty(varname.get()))
    {
        if(op.patch.vars[varname.get()]!=val.get()) 
            val.set( op.patch.vars[varname.get()] );
    }
    else 
    {
        val.set(defaultValue.get());
    }
}

exe.onTriggered=updateVar;
varname.onValueChange(updateVar);
val.onValueChange(updateVar);

defaultValue.onChange=function()
{
    val.set(defaultValue.get());
};