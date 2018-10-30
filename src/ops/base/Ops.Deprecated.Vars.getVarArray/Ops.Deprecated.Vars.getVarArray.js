
op.name='get var array';
var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));

var varname=op.addInPort(new CABLES.Port(op,"name",CABLES.OP_PORT_TYPE_VALUE,{type:'string'}));
var val=op.addOutPort(new CABLES.Port(op,"val",CABLES.OP_PORT_TYPE_ARRAY));
var defaultArr=op.inArray("Default Array");
var changed=op.outTrigger("Changed");


function updateVar()
{
    if(op.patch.vars && op.patch.vars[varname.get()])
    {
        val.set( op.patch.vars[varname.get()] );
        changed.trigger();
    }
    else 
    {
        if(val.get()!=defaultArr.get())
        {
            val.set(defaultArr.get());
            changed.trigger();
        }
    }
    
}

exe.onTriggered=updateVar;
varname.onValueChange(updateVar);
// val.onValueChange(updateVar);
