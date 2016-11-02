op.name='String';

// var v=op.addInPort(new Port(op,"value",OP_PORT_TYPE_VALUE,{type:'string'}));
var v=op.inValueString('value');
var result=op.addOutPort(new Port(op,"result"));

v.onValueChanged=function()
{
    if(result.get()!=v.get()) result.set(v.get());
};

v.set('');