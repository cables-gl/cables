var p=op.patch;
op.name='set var array';
var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));

var val=op.addInPort(new CABLES.Port(op,"val",CABLES.OP_PORT_TYPE_ARRAY,{}));
var varname=op.addInPort(new CABLES.Port(op,"name",CABLES.OP_PORT_TYPE_VALUE,{type:"string"}));

function updateVar()
{
    if(!p.vars)p.vars=[];
    p.vars[varname.get()]=val.get();
}

varname.onValueChange(updateVar);
val.onValueChange(updateVar);
exe.onTriggered=updateVar;