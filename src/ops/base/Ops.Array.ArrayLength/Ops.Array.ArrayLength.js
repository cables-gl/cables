op.name='ArrayLength';

var array=op.addInPort(new Port(op, "array",OP_PORT_TYPE_ARRAY));
var outLength=op.addOutPort(new Port(op, "length",OP_PORT_TYPE_VALUE));
outLength.ignoreValueSerialize=true;

function update()
{
    var l=0;
    if(array.get()) l=array.get().length;

    outLength.set(l);
}

array.onValueChanged=update;
