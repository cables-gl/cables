
var val=op.addInPort(new CABLES.Port(op,"Value",CABLES.OP_PORT_TYPE_VALUE));
var orval=op.addInPort(new CABLES.Port(op,"Default Value",CABLES.OP_PORT_TYPE_VALUE));
var result=op.addOutPort(new CABLES.Port(op,"Result",CABLES.OP_PORT_TYPE_VALUE));

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
