
var val=op.addInPort(new Port(op,"Value",OP_PORT_TYPE_VALUE));
var orval=op.addInPort(new Port(op,"Default Value",OP_PORT_TYPE_VALUE));
var result=op.addOutPort(new Port(op,"Result",OP_PORT_TYPE_VALUE));

val.ignoreValueSerialize=true;

function updateVar()
{
    if(!val.get())
    {
        result.set(orval.get());
    }
    else
    {
        result.set(val.get());
    }
}

val.onValueChanged=updateVar;
orval.onValueChanged=updateVar;
