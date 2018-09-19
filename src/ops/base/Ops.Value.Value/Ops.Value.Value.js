var v=op.addInPort(new Port(op,"value",OP_PORT_TYPE_VALUE));
var result=op.addOutPort(new Port(op,"result"));

var exec=function()
{
    result.set(parseFloat(v.get()));
};

v.onValueChanged=exec;
