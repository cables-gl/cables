
op.name='get var array';
var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));

var varname=op.addInPort(new Port(op,"name",OP_PORT_TYPE_VALUE,{type:'string'}));
var val=op.addOutPort(new Port(op,"val",OP_PORT_TYPE_ARRAY));

function updateVar()
{
    if(op.patch.vars && op.patch.vars[varname.get()])
        val.set( op.patch.vars[varname.get()] );
}

exe.onTriggered=updateVar;
varname.onValueChange(updateVar);
val.onValueChange(updateVar);
