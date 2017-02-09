op.name='String';

var v=op.inValueString("value","");
var result=op.addOutPort(new Port(op,"result"));

v.onChange=function()
{
    if(result.get()!=v.get()) result.set(v.get());
};

