Op.apply(this, arguments);

this.name='set var';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

var val=this.addInPort(new Port(this,"val"));
var varname=this.addInPort(new Port(this,"name",OP_PORT_TYPE_VALUE,{type:'string'}));

var patch=this.patch;
function updateVar()
{
    patch.vars[varname.get()]=val.get();
}

exe.onTriggered=updateVar;