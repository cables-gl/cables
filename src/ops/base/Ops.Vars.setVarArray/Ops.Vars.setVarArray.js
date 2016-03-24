var p=this.patch;
this.name='set var array';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

var val=this.addInPort(new Port(this,"val",OP_PORT_TYPE_ARRAY,{}));
var varname=this.addInPort(new Port(this,"name",OP_PORT_TYPE_VALUE,{type:"string"}));

function updateVar()
{
    if(!p.vars)p.vars=[];
    p.vars[varname.get()]=val.get();
}

varname.onValueChange(updateVar);
val.onValueChange(updateVar);
exe.onTriggered=updateVar;