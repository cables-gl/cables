
this.name='ArraySetValue';
var array=this.addInPort(new Port(this, "array",OP_PORT_TYPE_ARRAY));
var index=this.addInPort(new Port(this, "index",OP_PORT_TYPE_VALUE,{type:'int'}));
var value=this.addInPort(new Port(this, "value",OP_PORT_TYPE_VALUE));
var values=this.addOutPort(new Port(this, "values",OP_PORT_TYPE_ARRAY));

function update()
{
    array.get()[index.get()]=value.get();
    values.set(array.get());

}

index.onValueChanged=update;
array.onValueChanged=update;
