
this.name='ArrayGetValue';
var array=this.addInPort(new Port(this, "array",OP_PORT_TYPE_ARRAY));
var index=this.addInPort(new Port(this, "index",OP_PORT_TYPE_VALUE,{type:'int'}));
var value=this.addOutPort(new Port(this, "value",OP_PORT_TYPE_VALUE));
array.ignoreValueSerialize=true;


function update()
{
<<<<<<< HEAD
    if(array.get())value.set( array.get()[index.get()]);
=======
    if(array.get()) value.set( array.get()[index.get()]);
>>>>>>> 014d2002198940b0cb600b0c4e69467b6511247b
}

index.onValueChanged=update;
array.onValueChanged=update;
