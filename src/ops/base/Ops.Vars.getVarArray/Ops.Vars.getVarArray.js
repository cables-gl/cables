var self=this;

this.name='get var array';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

var varname=this.addInPort(new Port(this,"name",OP_PORT_TYPE_VALUE,{type:'string'}));
var val=this.addOutPort(new Port(this,"val",OP_PORT_TYPE_ARRAY));

function updateVar()
{
    if(self.patch.vars && self.patch.vars[varname.get()])
        val.set( self.patch.vars[varname.get()] );
}

exe.onTriggered=updateVar;
varname.onValueChange(updateVar);
val.onValueChange(updateVar);
