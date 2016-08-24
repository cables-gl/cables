op.name="NumberToString";


var val=op.addInPort(new Port(op,"Number",OP_PORT_TYPE_VALUE));

var result=op.addOutPort(new Port(op,"Result",OP_PORT_TYPE_VALUE,{type:'string'}));

val.onValueChanged=function()
{
    result.set( String(val.get()));
};



