var v=op.inValueString("value","");
const result=op.outNumber("result");

v.onChange=function()
{
    if(result.get()!=v.get()) result.set(v.get());
};

