op.name='Boolean';

var v=op.addInPort(new Port(op,"value",OP_PORT_TYPE_VALUE,{display:'bool'}));
var result=op.addOutPort(new Port(op,"result"));

exec=function()
{
    if(result.get()!=v.get()) result.set(v.get());
};

v.onValueChanged=exec;
v.set(false);