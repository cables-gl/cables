op.name='Boolean';

var v=op.addInPort(new CABLES.Port(op,"value",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
var result=op.addOutPort(new CABLES.Port(op,"result"));
v.set(false);
v.onValueChanged=exec;
result.set(v.get());

function exec()
{
    if(result.get()!=v.get()) result.set(v.get());
}

