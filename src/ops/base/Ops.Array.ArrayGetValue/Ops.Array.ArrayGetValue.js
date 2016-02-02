
this.name='ArrayGetValue';
var array=this.addInPort(new Port(this, "array",OP_PORT_TYPE_ARRAY));
var index=this.addInPort(new Port(this, "index",OP_PORT_TYPE_VALUE,{type:'int'}));
var value=this.addOutPort(new Port(this, "value",OP_PORT_TYPE_VALUE));

function update()
{
    value.set( array.val[index.get()]);
}

index.onValueChanged=update;
array.onValueChanged=update;
