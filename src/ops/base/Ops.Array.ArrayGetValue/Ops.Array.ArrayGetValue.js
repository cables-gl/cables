var array=op.addInPort(new Port(op, "array",OP_PORT_TYPE_ARRAY));
var index=op.inValueInt("index");

var value=op.addOutPort(new Port(op, "value",OP_PORT_TYPE_VALUE));
array.ignoreValueSerialize=true;

function update()
{
    if(array.get()) value.set( array.get()[index.get()]);
}

index.onChange=update;
array.onChange=update;
