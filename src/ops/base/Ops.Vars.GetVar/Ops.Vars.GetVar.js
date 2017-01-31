
op.name='get var';

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));

var varname=op.addInPort(new Port(op,"name",OP_PORT_TYPE_VALUE,{type:'string'}));
var val=op.addOutPort(new Port(op,"val",OP_PORT_TYPE_VALUE));
var defaultValue=op.inValue("Default Value",0);

val.ignoreValueSerialize=true;

function updateVar()
{
    if(op.patch.vars && op.patch.vars[varname.get()])
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