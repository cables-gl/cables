var v=op.inValueString("value","");
var result=op.addOutPort(new CABLES.Port(op,"result"));

v.onChange=function()
{
    if(result.get()!=v.get()) result.set(v.get());
};

