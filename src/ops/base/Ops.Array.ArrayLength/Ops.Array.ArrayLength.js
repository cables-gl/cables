op.name='ArrayLength';

var array=op.addInPort(new CABLES.Port(op, "array",CABLES.OP_PORT_TYPE_ARRAY));
var outLength=op.addOutPort(new CABLES.Port(op, "length",CABLES.OP_PORT_TYPE_VALUE));
outLength.ignoreValueSerialize=true;

function update()
{
    var l=0;
    if(array.get()) l=array.get().length;
    else l=-1;
    outLength.set(l);
}

array.onValueChanged=update;
