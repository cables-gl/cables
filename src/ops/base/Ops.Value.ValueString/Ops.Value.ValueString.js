var v=op.inValueString("value","");
const result=op.outValue("result");

v.onChange=function()
{
    if(result.get()!=v.get()) result.set(v.get());
};

