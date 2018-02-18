
var inStr=op.inValueString("String");
var outStr=op.outValue("Result");

inStr.onChange=function()
{
    if(!inStr.get())outStr.set('');
    else outStr.set(inStr.get().toLowerCase());
};
